@file:Suppress("DEPRECATION")

package rattclub.gravtrash.drivers

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
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.*
import com.squareup.picasso.Picasso
import kotlinx.android.synthetic.main.driver_fragment_home.*
import rattclub.gravtrash.Prevalent
import rattclub.gravtrash.R
import rattclub.gravtrash.model.Message
import rattclub.gravtrash.drivers.model.Request
import rattclub.gravtrash.drivers.model.RequestViewHolder
import rattclub.gravtrash.model.InboxViewHolder
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.HashMap

class DriverHomeFragment : Fragment(), OnMapReadyCallback,
                        GoogleApiClient.ConnectionCallbacks,
                        GoogleApiClient.OnConnectionFailedListener,
                        LocationListener {
    private lateinit var root: View
    private val mAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference
    private var senderMarker: Marker? = null
    private var isAvailable = true

    // Google map
    private lateinit var map: GoogleMap
    private lateinit var googleApiClient: GoogleApiClient
    private lateinit var lastLocation: Location
    private lateinit var locationRequest: LocationRequest
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    // Fab dialogs
    private lateinit var inboxDialog: Dialog
    private lateinit var requestDialog: Dialog
    private lateinit var layoutManager: RecyclerView.LayoutManager



    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
         root = inflater.inflate(R.layout.driver_fragment_home, container, false)

        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        val mapFragment = childFragmentManager.findFragmentById(R.id.driver_map) as SupportMapFragment
        mapFragment.getMapAsync(this)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(activity!!.applicationContext)

        // inbox fab
        inboxDialog = Dialog(root.context)
        inboxDialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        inboxDialog.setContentView(R.layout.inbox_pop_up_layout)
        inboxDialog.setCanceledOnTouchOutside(true)
        val inboxFab: FloatingActionButton = root.findViewById(R.id.driver_msg_fab)
        inboxFab.setOnClickListener {
            driver_fab_menu.collapse()
            handlePopUpInbox()
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
        isAvailable = true
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
        if (isAvailable) {
            val aDriversRef = FirebaseDatabase.getInstance().reference.child("Available Drivers")
            val geoFire = GeoFire(aDriversRef)
            geoFire.setLocation(mAuth.currentUser!!.uid, GeoLocation(p0.latitude,p0.longitude),
                GeoFire.CompletionListener { _, _ ->})
        }

    }

    private fun enableMyLocation() {
        if (isPermissionGranted()) map.isMyLocationEnabled = true
        else requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
            Prevalent.REQUEST_LOCATION_PERMISSION)
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
                // update user name, profile image
                val listUserID = getRef(position).key.toString() //get reference under the current uid
                var senderUserID = ""
                val getTypeRef = getRef(position).child("request_type").ref
                getTypeRef.addValueEventListener(object: ValueEventListener{
                    override fun onCancelled(p0: DatabaseError) {}
                    override fun onDataChange(p0: DataSnapshot) {
                        if (p0.exists()) {
                            if (p0.value.toString() == "received") {
                                holder.userPrice.text = "${model.price}$"
                                holder.userAdress.text = model.pickup_address
                                senderUserID = listUserID
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

                // set on click listeners for buttons
                holder.acceptBtn.setOnClickListener{ if (senderUserID != "") acceptRequest(senderUserID, model) }
                holder.declineBtn.setOnClickListener{ deleteRequest(senderUserID) }

            }
        }

        requestRecycleList.adapter = adapter
        adapter.startListening()


        requestDialog.show()
    }

    /** convert the request to message in Database,
     * delete the request and update map position **/
    private fun acceptRequest(senderUserID: String, request: Request) {
        val messageSenderRef = "Messages/$senderUserID/${mAuth.currentUser?.uid.toString()}"
        val messageReceiverRef = "Messages/${mAuth.currentUser?.uid.toString()}/$senderUserID"

        // create unique key for each message sent
        val userMessageKeyRef = rootRef.child("Messages").child(senderUserID)
            .child(mAuth.currentUser?.uid.toString()).push()
        val messageID = userMessageKeyRef.key


        val fullMessage = "${request.message} " +
                "Price: ${request.price}$ \n " +
                "Pick up location: ${request.pickup_address}"
        val calendar = Calendar.getInstance()
        val currentDate = SimpleDateFormat("MMM dd, yyyy")
        val currentTime = SimpleDateFormat("hh:mm a")
        var messageDetailsMap: HashMap<String, Any> = HashMap()
        messageDetailsMap["messageID"] = messageID.toString()
        messageDetailsMap["message"] = fullMessage
        messageDetailsMap["from"] = senderUserID
        messageDetailsMap["to"] = mAuth.currentUser?.uid.toString()
        messageDetailsMap["date"] = currentDate.format(calendar.time)
        messageDetailsMap["time"] = currentTime.format(calendar.time)

        // referencing child nodes layout in database with HashMap
        var messageRefMap: HashMap<String, Any> = HashMap()
        messageRefMap["$messageSenderRef/${messageID.toString()}"] = messageDetailsMap
        messageRefMap["$messageReceiverRef/${messageID.toString()}"] = messageDetailsMap

        rootRef.updateChildren(messageRefMap).addOnCompleteListener{task ->
            if (task.isSuccessful) {
                focusToPickUpLocation(request.pickup_location)
//                deleteRequest(senderUserID)
//                disconnectDriver()

            }else { Log.i("error_messages", "${task.exception}") }


        }

        requestDialog.dismiss()
    }


    private fun deleteRequest(senderUserID: String) {
        val requestRef = rootRef.child("Requests")
        requestRef.child(mAuth.currentUser?.uid.toString())
            .child(senderUserID)
            .removeValue()
            .addOnCompleteListener{task ->
                if (task.isSuccessful) {
                    requestRef.child(senderUserID)
                        .child(mAuth.currentUser?.uid.toString())
                        .removeValue()
                }
            }
    }

    private fun focusToPickUpLocation(pickupLocation: HashMap<String, Double>) {
        val customerLatLng = LatLng(pickupLocation["lat"]!!, pickupLocation["lng"]!!)
        map.moveCamera(CameraUpdateFactory.newLatLng(customerLatLng))
        map.animateCamera(CameraUpdateFactory.zoomTo(Prevalent.CAMERA_ZOOM_VALUE))
        if (senderMarker != null) senderMarker?.remove()
        senderMarker = map.addMarker(MarkerOptions()
            .position(LatLng(customerLatLng.latitude, customerLatLng.longitude))
            .title("Customer")
            .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_ROSE)))
    }

    private fun disconnectDriver() {
        isAvailable = false
        val aDriversRef = FirebaseDatabase.getInstance().reference.child("Available Drivers")
        val customerGeoFire = GeoFire(aDriversRef)
        customerGeoFire.removeLocation(FirebaseAuth.getInstance().currentUser?.uid,
            GeoFire.CompletionListener { _, _ ->})
    }

    private fun handlePopUpInbox() {
        val inboxRecycleList = inboxDialog.findViewById<RecyclerView>(R.id.inbox_recycler_view)
        inboxRecycleList.setHasFixedSize(true)
        layoutManager = LinearLayoutManager(root.context)
        inboxRecycleList.layoutManager = layoutManager

        val options = FirebaseRecyclerOptions.Builder<Message>()
            .setQuery(rootRef.child("Messages")
                .child(mAuth.currentUser?.uid.toString()),
                Message::class.java)
            .build()

        val adapter = object: FirebaseRecyclerAdapter<Message, InboxViewHolder> (options) {
            override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): InboxViewHolder {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.inbox_user_display_layout, parent, false)
                view.setBackgroundResource(R.color.colorAccent)
                return InboxViewHolder(view)
            }

            override fun onBindViewHolder(holder: InboxViewHolder, position: Int, model: Message) {
                val listUserID = getRef(position).key.toString()
                getRef(position).addChildEventListener(object: ChildEventListener{
                    override fun onCancelled(p0: DatabaseError) {}
                    override fun onChildMoved(p0: DataSnapshot, p1: String?) {}
                    override fun onChildChanged(p0: DataSnapshot, p1: String?) {}
                    override fun onChildAdded(p0: DataSnapshot, p1: String?) {
                        if (p0.exists()) {
                            Log.i("test", p0.key.toString())
                            // retrieve from Messages database
                            holder.userLastMessage.text = p0.child("message").value.toString()
                            val lastSentTime = p0.child("time").value.toString() +
                                    " " + p0.child("date").value.toString()
                            holder.userLastSent.text = lastSentTime


                            rootRef.child("Users")
                                .child(listUserID)
                                .addListenerForSingleValueEvent(object: ValueEventListener {
                                    override fun onCancelled(p0: DatabaseError) {}
                                    override fun onDataChange(p0: DataSnapshot) {
                                        if (p0.exists()) {
                                            val fullName = p0.child("first_name").value.toString() +
                                                    " " + p0.child("last_name").value.toString()
                                            holder.userName.text = fullName
                                            Picasso.get().load(p0.child("image").value.toString())
                                                .placeholder(R.drawable.profile).into(holder.userProfileImage)
                                        }
                                    }
                                })
                        }
                    }
                    override fun onChildRemoved(p0: DataSnapshot) {}

                })
            }

        }

        inboxRecycleList.adapter = adapter
        adapter.startListening()



        inboxDialog.show()
    }


    // Unused interfaces
    override fun onConnectionSuspended(p0: Int) {}
    override fun onConnectionFailed(p0: ConnectionResult) {}
}
