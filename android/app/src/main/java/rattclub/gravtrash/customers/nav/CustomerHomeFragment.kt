@file:Suppress("DEPRECATION")

package rattclub.gravtrash.customers.nav

import android.Manifest
import android.app.Dialog
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.location.Geocoder
import android.location.Location
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.util.SparseBooleanArray
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.firebase.geofire.GeoFire
import com.firebase.geofire.GeoLocation
import com.firebase.geofire.GeoQuery
import com.firebase.geofire.GeoQueryEventListener
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
import kotlinx.android.synthetic.main.customer_fragment_home.*
import kotlinx.android.synthetic.main.customer_request_pop_up_layout.*
import rattclub.gravtrash.PhoneInputActivity
import rattclub.gravtrash.model.Prevalent
import rattclub.gravtrash.R
import rattclub.gravtrash.customers.model.Item
import rattclub.gravtrash.customers.model.ItemViewHolder
import java.lang.Math.*
import java.util.*
import kotlin.collections.HashMap

class CustomerHomeFragment : Fragment(),
                            OnMapReadyCallback ,
                            GoogleApiClient.ConnectionCallbacks,
                            GoogleApiClient.OnConnectionFailedListener,
                            LocationListener{
    private lateinit var root: View
    private val mAuth = FirebaseAuth.getInstance()
    private val rootRef = FirebaseDatabase.getInstance().reference


    // Google map
    private lateinit var map: GoogleMap
    private lateinit var googleApiClient: GoogleApiClient
    private lateinit var lastLocation: Location
    private lateinit var locationRequest: LocationRequest
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    // Searching for drivers
    private lateinit var geoQuery: GeoQuery
    private var searching = false
    private var searchRadius = 1.2
    private var driverFoundKeyMap: HashMap<String?, String?> = HashMap()
    private var driverFoundLocationsMap: HashMap<String?,GeoLocation?> = HashMap()
    private var driverMarkersMap: HashMap<String?,Marker> = HashMap()
    private var closetDriverKey: String? = ""
    private var closetDriverDistance: Double = 9999.99

    // FAB dialogs
    private lateinit var inboxDialog: Dialog
    private lateinit var requestDialog: Dialog
    private lateinit var layoutManager: RecyclerView.LayoutManager





    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        root = inflater.inflate(R.layout.customer_fragment_home, container, false)

        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        val mapFragment = childFragmentManager.findFragmentById(R.id.customer_map) as SupportMapFragment
        mapFragment.getMapAsync(this)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(activity!!.applicationContext)


        // inbox fab
        inboxDialog = Dialog(root.context)
        inboxDialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        inboxDialog.setContentView(R.layout.inbox_pop_up_layout)
        inboxDialog.setCanceledOnTouchOutside(true)
        val chatFab: FloatingActionButton = root.findViewById(R.id.customer_msg_fab)
        chatFab.setOnClickListener {
            Prevalent.handlePopUpInbox(root.context, inboxDialog)
            customer_fab_menu.collapse()
        }

        // search fab
        val searchFab = root.findViewById<FloatingActionButton>(R.id.customer_search_fab)
        searchFab.setOnClickListener {
            customer_fab_menu.collapse()
            searching = !searching
            Log.i("Test_keymap", driverFoundKeyMap.size.toString())
            Log.i("Test_location_map", driverFoundLocationsMap.size.toString())
            Log.i("Test_marker_map", driverMarkersMap.size.toString())
            Log.i("Test_closet__key", closetDriverKey)
            Log.i("Test_closet_distance", closetDriverDistance.toString())
            if (searching){ getClosetDriver() }

        }

        // request fab
        requestDialog = Dialog(root.context)
        requestDialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        requestDialog.setContentView(R.layout.customer_request_pop_up_layout)
        requestDialog.setCanceledOnTouchOutside(true)
        val sendRequestFab: FloatingActionButton = root.findViewById(R.id.customer_request_fab)
        sendRequestFab.setOnClickListener {
            customer_fab_menu.collapse()
            if (driverFoundKeyMap.size > 0) {
                requestClosetDriver()
            }
            else {
                Toast.makeText(root.context, "There is no driver nearby", Toast.LENGTH_SHORT).show()
            }
        }

        // cancel request fab
        val cancelRequestFab: FloatingActionButton = root.findViewById(R.id.customer_cancel_request_fab)
        cancelRequestFab.setOnClickListener {
            cancelRequest()
            customer_fab_menu.collapse()
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
                    lastLocation = location!!
                    val latLng = LatLng(location.latitude, location.longitude)
                    map.moveCamera(CameraUpdateFactory.newLatLng(latLng))
                    map.animateCamera(CameraUpdateFactory.zoomTo(Prevalent.CAMERA_ZOOM_VALUE))
                }
        }
    }

    override fun onStop() {
        super.onStop()
        disconnectCustomer()
    }

    override fun onConnected(p0: Bundle?) {
        locationRequest = LocationRequest()
        locationRequest.interval = Prevalent.LOCATION_REQUEST_REFRESH_INTERVAL
        locationRequest.fastestInterval = Prevalent.LOCATION_REQUEST_FASTEST_INTERVAL
        locationRequest.priority = Prevalent.PRIORITY_HIGH_ACCURACY

        LocationServices.FusedLocationApi
            .requestLocationUpdates(googleApiClient, locationRequest,this@CustomerHomeFragment)
    }

    override fun onLocationChanged(p0: Location?) {
        lastLocation = p0!!
        if (searching) {
            val aCustomersRef = FirebaseDatabase.getInstance().reference
                .child("Available Customers")
            val geoFire = GeoFire(aCustomersRef)
            geoFire.setLocation(mAuth.currentUser?.uid, GeoLocation(p0.latitude,p0.longitude),
                GeoFire.CompletionListener { _, _ ->})
        }

    }

    private fun getClosetDriver() {
        val aDriverRef = FirebaseDatabase.getInstance().reference.child("Available Drivers")
        val geoFire = GeoFire(aDriverRef)
        geoQuery = geoFire.queryAtLocation(GeoLocation(lastLocation.latitude, lastLocation.longitude), searchRadius)
        geoQuery.removeAllListeners()
        geoQuery.addGeoQueryEventListener(object: GeoQueryEventListener{
            override fun onGeoQueryReady() {
                // this method is called when no nearby driver found in the search radius
                // if no driver found increase search radius
                if (driverFoundLocationsMap.isEmpty() && searchRadius <= SEARCH_RADIUS_MAX && searching)
                    searchRadius += 1 ; getClosetDriver()
                if (driverFoundLocationsMap.isEmpty() && searchRadius > SEARCH_RADIUS_MAX && searching) {
                    customer_search_fab?.visibility = View.VISIBLE
                    customer_request_fab?.visibility = View.GONE
                    disconnectCustomer()
                }
            }

            override fun onKeyEntered(key: String?, location: GeoLocation?) {
                // store in the array list of nearby drivers with its current location
                if (key != mAuth.currentUser?.uid && driverFoundKeyMap[key] != key && searching) {
                    driverFoundKeyMap[key] = key
                    driverFoundLocationsMap[key] = location
                    // display all driver on map with custom marker
                    if (driverMarkersMap[key] != null) {
                        driverMarkersMap[key]!!.remove()
                        driverMarkersMap.remove(key)
                    }
                    driverMarkersMap[key] = map.addMarker(MarkerOptions()
                        .position(LatLng(location!!.latitude, location.longitude))
                        .title("Collector")
                        .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN)))
                    // calculate distance for each driver found -> closet driver
                    val curDistance = distance(lastLocation.latitude, lastLocation.longitude, location.latitude, location.longitude)
                    if (curDistance < closetDriverDistance) {
                        closetDriverDistance = curDistance
                        closetDriverKey = key
                    }
                    customer_search_fab?.visibility = View.GONE
                    customer_request_fab?.visibility = View.VISIBLE
                }
            }

            override fun onKeyMoved(key: String?, location: GeoLocation?) {}
            override fun onKeyExited(key: String?) {
                // remove the driver from array list of nearby drivers
                driverFoundKeyMap.remove(key)
                driverFoundLocationsMap.remove(key)
                if (driverMarkersMap[key] != null) {
                    driverMarkersMap[key]!!.remove()
                    driverMarkersMap.remove(key)
                }
            }
            override fun onGeoQueryError(error: DatabaseError?) {}
        })
    }

    private fun distance(lat1: Double, lng1: Double, lat2: Double, lng2: Double): Double {
        val earthRadius = 6371 // in kilometers, change to 3958.75 for miles output
        val dLat = toRadians(lat2 - lat1)
        val dLng = toRadians(lng2 - lng1)
        val sindLat = sin(dLat / 2)
        val sindLng = sin(dLng / 2)
        val a = pow(sindLat, 2.0) + (pow(sindLng, 2.0) * cos(toRadians(lat1)) * cos(toRadians(lat2)))
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return earthRadius * c // output distance, in MILES
    }

    private fun requestClosetDriver() {
        mAuth.currentUser?.uid?.let {
            rootRef.child("Users").child(it).child("phone")
                .addListenerForSingleValueEvent(object: ValueEventListener {
                    override fun onCancelled(p0: DatabaseError) {}
                    override fun onDataChange(p0: DataSnapshot) {
                        if (p0.value.toString() != "") {
                            handleRequestPopUp()
                        }else {
                            // create a alert dialog
                            activity?.let {
                                val builder: AlertDialog.Builder? = activity?.let { AlertDialog.Builder(it) }
                                builder?.setMessage("You have not set your phone number!" +
                                        " Please set your phone number to continue")
                                builder?.apply {
                                    setPositiveButton("OK") { _, _ ->
                                        startActivity(Intent(root.context, PhoneInputActivity::class.java))
                                    }
                                    setNegativeButton("Cancel") { dialog, _ ->
                                        dialog.cancel()
                                    }
                                }
                                builder?.create()
                                builder?.show()
                            }
                        }
                    }
                })
        }
    }

    private fun handleRequestPopUp() {
        var selectedItemsMap: HashMap<Int, Item> = HashMap()
        var quantityItemsMap: HashMap<Int, Double?> = HashMap()
        var sparseBooleanArray = SparseBooleanArray()
        var totalAmount = 0.0

        requestDialog.request_total_earning.text = "${totalAmount}$"
        requestDialog.request_calc_earning.setOnClickListener {
            totalAmount = 0.0
            requestDialog.request_total_earning.text = "${totalAmount}$"
            for ((key, value) in selectedItemsMap) {
                totalAmount += value.price * quantityItemsMap[key]!!
                requestDialog.request_total_earning.text = "${totalAmount}$"
            }
        }


        val recycleItemList = requestDialog.findViewById<RecyclerView>(R.id.request_item_recycler_view)
        recycleItemList.setHasFixedSize(true)
        layoutManager = LinearLayoutManager(requestDialog.context)
        recycleItemList.layoutManager = layoutManager

        // recycler view
        val options = FirebaseRecyclerOptions.Builder<Item>()
            .setQuery(rootRef.child("Items"), Item::class.java)
            .build()

        val adapter = object: FirebaseRecyclerAdapter<Item, ItemViewHolder>(options) {
            override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ItemViewHolder {
                val view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.recycle_item_display_layout, parent, false)
                return ItemViewHolder(view)
            }

            override fun onBindViewHolder(holder: ItemViewHolder, position: Int, model: Item) {
                holder.itemCategory.text = model.category
                holder.itemPrice.text = "${model.price}$/kg"
                Picasso.get().load(model.image).into(holder.itemImage)

                if (!sparseBooleanArray.get(position)) {
                    holder.itemView.setBackgroundResource(R.color.colorAccent)
                    holder.itemQuantity.visibility = View.GONE
                    holder.itemQuantity.setText("0.0")
                    holder.itemQuantity.removeTextChangedListener(object: TextWatcher{
                        override fun afterTextChanged(s: Editable?) {}
                        override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                        override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                    })
                    holder.itemKgText.visibility = View.GONE

                }else if (sparseBooleanArray.get(position)){
                    holder.itemView.setBackgroundResource(R.color.colorAccent2)
                    holder.itemQuantity.visibility = View.VISIBLE
                    holder.itemQuantity.setText("0.0")
                    holder.itemQuantity.addTextChangedListener (object: TextWatcher {
                        override fun afterTextChanged(s: Editable?) {}
                        override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                        override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                            var quantityStr:String? = holder.itemQuantity.text.toString()
                            if (quantityStr == null || quantityStr == "") {
                                quantityStr = "0.0"
                            }
                            quantityItemsMap[position] = quantityStr.toDouble()
                        }

                    })
                    holder.itemKgText.visibility = View.VISIBLE

                }

                holder.itemView.setOnClickListener {
                    if (!sparseBooleanArray.get(position)) {
                        sparseBooleanArray.put(position, true)
                        selectedItemsMap[position] = model
                        notifyItemChanged(position)
                    }else if (sparseBooleanArray.get(position)){
                        sparseBooleanArray.put(position, false)
                        selectedItemsMap.remove(position)
                        quantityItemsMap[position] = 0.0
                        notifyItemChanged(position)
                    }

                }
            }

        }

        recycleItemList.adapter = adapter
        adapter.startListening()

        requestDialog.show()

        // handle send request
        val sendButton = requestDialog.findViewById<Button>(R.id.request_send_msg_btn)
        sendButton.setOnClickListener {
            var requestTotalAmount = 0.0
            var message: String? = "${requestDialog.request_edit_text.text} \n"
            for ((key,value) in selectedItemsMap) {
                requestTotalAmount += value.price * quantityItemsMap[key]!!
                message += "${value.category}: ${quantityItemsMap[key].toString()} kg \n"
            }

            sendRequest(message, requestTotalAmount)
        }

    }

    private fun sendRequest(message: String?, requestTotalAmount: Double) {
        var requestMap: HashMap<String,Any?> = HashMap()
        requestMap["request_type"] = "sent"
        requestMap["message"] = message
        requestMap["price"] = requestTotalAmount
        // pick up locality
        var locationMap: HashMap<String, Double> = HashMap()
        locationMap["lat"] = lastLocation.latitude; locationMap["lng"] = lastLocation.longitude
        requestMap["pickup_location"] = locationMap

        val geoCoder = Geocoder(root.context, Locale.ENGLISH)
        val addresses = geoCoder.getFromLocation(lastLocation.latitude, lastLocation.longitude,1)
        if (addresses.size > 0) {
            val fetchedAddress = addresses[0].getAddressLine(0)
            requestMap["pickup_address"] = fetchedAddress
        }else {
            requestMap["pickup_address"] = ""
        }

        val requestRef = rootRef.child("Requests")
        requestRef.child(mAuth.currentUser?.uid.toString()).child(closetDriverKey.toString())
            .updateChildren(requestMap)
            .addOnCompleteListener{task->
                if (task.isSuccessful) {
                    requestMap["request_type"] = "received"
                    requestRef.child(closetDriverKey.toString()).child(mAuth.currentUser?.uid.toString())
                        .updateChildren(requestMap)
                        .addOnCompleteListener{task ->
                            if (task.isSuccessful) {
                                customer_request_fab?.visibility = View.GONE
                                customer_cancel_request_fab?.visibility = View.VISIBLE
                                Toast.makeText(root.context, "Request sent to the closet Collector",
                                    Toast.LENGTH_LONG).show()
                            }
                        }
                }
            }



        requestDialog.dismiss()
    }

    private fun cancelRequest() {
        val requestRef = rootRef.child("Requests")
        requestRef.child(mAuth.currentUser?.uid.toString()).child(closetDriverKey.toString())
            .removeValue()
            .addOnCompleteListener{task ->
                if (task.isSuccessful) {
                    requestRef.child(closetDriverKey.toString()).child(mAuth.currentUser?.uid.toString())
                        .removeValue()
                        .addOnCompleteListener{task->
                            if (task.isSuccessful){
                                disconnectCustomer()
                                customer_cancel_request_fab?.visibility = View.GONE
                                if (closetDriverKey != null) {
                                    customer_search_fab?.visibility = View.GONE
                                    customer_request_fab?.visibility = View.VISIBLE
                                }else {
                                    customer_search_fab?.visibility = View.VISIBLE
                                    customer_request_fab?.visibility = View.GONE
                                }
                            }
                        }
                }
            }
    }



    private fun disconnectCustomer() {
        if (searching)geoQuery.removeAllListeners()
        searching = false
        val aCustomersRef = FirebaseDatabase.getInstance().reference.child("Available Customers")
        val customerGeoFire = GeoFire(aCustomersRef)
        customerGeoFire.removeLocation(FirebaseAuth.getInstance().currentUser?.uid,
            GeoFire.CompletionListener { _, _ ->})
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



    override fun onConnectionSuspended(p0: Int) { disconnectCustomer() }
    override fun onConnectionFailed(p0: ConnectionResult) { disconnectCustomer()}

    companion object {
        const val SEARCH_RADIUS_MAX: Double = 4.0
    }
}
