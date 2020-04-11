@file:Suppress("DEPRECATION")

package rattclub.gravtrash.drivers.nav

import android.Manifest
import android.app.Dialog
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.location.Location
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.firebase.geofire.GeoFire
import com.firebase.geofire.GeoLocation
import com.firebase.ui.database.FirebaseRecyclerAdapter
import com.firebase.ui.database.FirebaseRecyclerOptions
import com.getbase.floatingactionbutton.FloatingActionButton
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.api.GoogleApiClient
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationListener
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.squareup.picasso.Picasso
import kotlinx.android.synthetic.main.driver_fragment_home.*
import rattclub.gravtrash.Prevalent
import rattclub.gravtrash.R
import rattclub.gravtrash.drivers.model.Request
import rattclub.gravtrash.drivers.model.RequestViewHolder

class DriverHomeFragment : Fragment(), OnMapReadyCallback,
                        GoogleApiClient.ConnectionCallbacks,
                        GoogleApiClient.OnConnectionFailedListener,
                        LocationListener {
    private lateinit var root: View
    private val mAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference

    // Google map
    private lateinit var map: GoogleMap
    private lateinit var googleApiClient: GoogleApiClient
    private lateinit var lastLocation: Location
    private lateinit var locationRequest: LocationRequest
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    // Fab dialogs
    private lateinit var msgDialog: Dialog
    private lateinit var requestDialog: Dialog
    private lateinit var layoutManager: RecyclerView.LayoutManager



    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
         root = inflater.inflate(R.layout.driver_fragment_home, container, false)

        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        val mapFragment = childFragmentManager.findFragmentById(R.id.driver_map) as SupportMapFragment
        mapFragment.getMapAsync(this)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(activity!!.applicationContext)

        val msgFab: FloatingActionButton = root.findViewById(R.id.driver_msg_fab)
        msgFab.setOnClickListener {
            driver_fab_menu.collapse()
        }


        // request fab
        requestDialog = Dialog(root.context)
        requestDialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        requestDialog.setContentView(R.layout.driver_request_pop_up_layout)
        requestDialog.setCanceledOnTouchOutside(true)
        val requestFab: FloatingActionButton = root.findViewById(R.id.driver_request_fab)
        requestFab.setOnClickListener{
            driver_fab_menu.collapse()
            handleRequestPopUp()
        }


        return root
    }

    override fun onMapReady(googleMap: GoogleMap?) {
        map = googleMap!!
        buildGoogleApiClient()
        enableMyLocation()
        if (isPermissionGranted()) {
            fusedLocationClient.lastLocation
                .addOnSuccessListener { location : Location? ->
                    if (location != null) {
                        lastLocation = location
                    }
                    val latLng = location?.let { LatLng(it.latitude, it.longitude) }
                    map.moveCamera(CameraUpdateFactory.newLatLng(latLng))
                    map.animateCamera(CameraUpdateFactory.zoomTo(Prevalent.CAMERA_ZOOM_VALUE))
                }
        }
    }

    override fun onConnected(p0: Bundle?) {
        locationRequest = LocationRequest()
        locationRequest.interval = Prevalent.LOCATION_REQUEST_REFRESH_INTERVAL
        locationRequest.fastestInterval = Prevalent.LOCATION_REQUEST_FASTEST_INTERVAL
        locationRequest.priority = Prevalent.PRIORITY_HIGH_ACCURACY

        LocationServices.FusedLocationApi
            .requestLocationUpdates(googleApiClient, locationRequest,this@DriverHomeFragment)
    }



    override fun onLocationChanged(p0: Location?) {
        lastLocation = p0!!

        val aDriversRef = FirebaseDatabase.getInstance().reference.child("Available Drivers")
        val geoFire = GeoFire(aDriversRef)
        geoFire.setLocation(mAuth.currentUser!!.uid, GeoLocation(p0.latitude,p0.longitude),
            GeoFire.CompletionListener { _, _ ->})
    }

    private fun enableMyLocation() {
        if (isPermissionGranted()) map.isMyLocationEnabled = true
        else requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
            Prevalent.REQUEST_LOCATION_PERMISSION)
    }

    private fun handleRequestPopUp() {
        val requestRecycleList = requestDialog.findViewById<RecyclerView>(R.id.incoming_request_recycler_view)
        requestRecycleList.setHasFixedSize(true)
        layoutManager = LinearLayoutManager(root.context)
        requestRecycleList.layoutManager = layoutManager

        val options = FirebaseRecyclerOptions.Builder<Request>()
            .setQuery(rootRef.child("Requests")
                .child(mAuth.currentUser?.uid.toString()),
                Request::class.java)
            .build()

        val adapter = object: FirebaseRecyclerAdapter<Request,RequestViewHolder>(options) {
            override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RequestViewHolder {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.request_user_display_layout, parent, false)
                view.setBackgroundResource(R.color.colorAccent)
                return RequestViewHolder(view)
            }

            override fun onBindViewHolder(holder: RequestViewHolder, position: Int, model: Request) {
                holder.userPrice.text = "${model.price}$"
                holder.userAdress.text = model.pickup_address
//                Log.i("location_test",model.pickup_location["lat"].toString())

                //get reference under the current uid
                val listUserID = getRef(position).key.toString()
                val getTypeRef = getRef(position).child("request_type").ref
                getTypeRef.addValueEventListener(object: ValueEventListener{
                    override fun onCancelled(p0: DatabaseError) {}
                    override fun onDataChange(p0: DataSnapshot) {
                        if (p0.exists()) {
                            if (p0.value.toString() == "received") {
                                val usersRef = rootRef.child("Users")
                                usersRef.child(listUserID).addValueEventListener(object: ValueEventListener {
                                    override fun onCancelled(p0: DatabaseError) {}
                                    override fun onDataChange(p0: DataSnapshot) {
                                        // load user name
                                        val requestUserName = p0.child("first_name").value.toString() +
                                                " " + p0.child("last_name").value.toString()
                                        holder.userName.text = requestUserName
                                        // load user profile image
                                        if (p0.hasChild("image")) {
                                            val requestProfileImage = p0.child("image").value.toString()
                                            Picasso.get().load(requestProfileImage)
                                                .placeholder(R.drawable.profile)
                                                .into(holder.userProfileImage)
                                        }
                                    }

                                })
                            }
                        }
                    }

                })
            }
        }

        requestRecycleList.adapter = adapter
        adapter.startListening()


        requestDialog.show()
    }

    // Google Map permissions and api
    @Synchronized
    private fun buildGoogleApiClient() {
        googleApiClient = GoogleApiClient.Builder(activity!!.applicationContext)
            .addConnectionCallbacks(this)
            .addOnConnectionFailedListener(this)
            .addApi(LocationServices.API)
            .build()
        googleApiClient.connect()
    }

    private fun isPermissionGranted() : Boolean {
        return ContextCompat.checkSelfPermission(context!!,
            Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        if (requestCode == Prevalent.REQUEST_LOCATION_PERMISSION) {
            if (grantResults.contains(PackageManager.PERMISSION_GRANTED))
                enableMyLocation()
        }
    }



    // Unused interfaces
    override fun onConnectionSuspended(p0: Int) {}
    override fun onConnectionFailed(p0: ConnectionResult) {}
}
