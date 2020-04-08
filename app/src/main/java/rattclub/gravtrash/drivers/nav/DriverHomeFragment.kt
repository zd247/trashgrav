@file:Suppress("DEPRECATION")

package rattclub.gravtrash.drivers.nav

import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProviders
import com.firebase.geofire.GeoFire
import com.firebase.geofire.GeoLocation
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
import com.google.firebase.database.FirebaseDatabase
import rattclub.gravtrash.Prevalent
import rattclub.gravtrash.R
import rattclub.gravtrash.customers.nav.CustomerHomeFragment

class DriverHomeFragment : Fragment(), OnMapReadyCallback,
                        GoogleApiClient.ConnectionCallbacks,
                        GoogleApiClient.OnConnectionFailedListener,
                        LocationListener {
    private lateinit var root: View
    private val mAuth = FirebaseAuth.getInstance()

    // Google map
    private lateinit var map: GoogleMap
    private lateinit var googleApiClient: GoogleApiClient
    private lateinit var lastLocation: Location
    private lateinit var locationRequest: LocationRequest
    private lateinit var fusedLocationClient: FusedLocationProviderClient


    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
         root = inflater.inflate(R.layout.driver_fragment_home, container, false)

        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        val mapFragment = childFragmentManager.findFragmentById(R.id.driver_map) as SupportMapFragment
        mapFragment.getMapAsync(this)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(activity!!.applicationContext)

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
