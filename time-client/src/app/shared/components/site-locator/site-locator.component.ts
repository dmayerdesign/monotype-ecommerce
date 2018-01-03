import { Component, Input, OnInit } from '@angular/core'

import { AppConfig } from '@time/app-config'

declare const google: any
declare let window: any

@Component({
    selector: 'site-locator',
    templateUrl: './site-locator.component.html',
    styleUrls: ['./site-locator.component.scss'],
})
export class SiteLocatorComponent implements OnInit {

    @Input() public initialLatLng: { lat: number, lng: number }

    public filter: {
        filterKey: string;
        filterValue: string;
    } = {
        filterKey: '',
        filterValue: '',
    }

    constructor() {}

    public ngOnInit(): void {
        if (typeof window === 'undefined') {
            return
        }
        window.initGoogleMapsSiteLocator = () => {
            let map
            /*****************************
             * Get these from the database
             ****************************/
            const markers = (<any>AppConfig).locator_map_markers
            let bounds = new google.maps.LatLngBounds()

            // Display multiple markers on a map
            const infoWindow = new google.maps.InfoWindow()
            let marker
            // Create the search box and link it to the UI element.
            const input = document.getElementById('pac-input')
            const searchBox = new google.maps.places.SearchBox(input)

            if (this.initialLatLng) {
                map = new google.maps.Map(document.getElementById('map'), {
                    center: this.initialLatLng,
                    zoom: 5,
                    mapTypeId: 'roadmap',
                })
            }
            else {
                map = new google.maps.Map(document.getElementById('map'), {
                    center: new google.maps.LatLng(42, -83),
                    zoom: 5,
                    mapTypeId: 'roadmap',
                })
            }

            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input)

            // Bias the SearchBox results towards current map's viewport.
            map.addListener('bounds_changed', function() {
                searchBox.setBounds(map.getBounds())
            })

            for (let i = 0; i < markers.length; i++) {
                if (markers[i].marker) {
                    const position = new google.maps.LatLng(markers[i].marker[1], markers[i].marker[2])
                    bounds.extend(position)
                    marker = new google.maps.Marker({
                            position,
                            map,
                            title: markers[i].marker[0],
                    })

                    // Allow each marker to have an info window
                    google.maps.event.addListener(marker, 'click', ((m, index) => {
                        return function() {
                            infoWindow.setContent(`
                                <div class='info_content'>
                                    <h3>${markers[index].marker[0]}</h3>
                                    <p>${markers[index].description}</p>
                                </div>`)
                            infoWindow.open(map, m)
                        }
                    })(marker, i))

                    if (markers.length === 1) {
                        map.setCenter(position)
                        map.setZoom(10)
                    } else {
                        // Automatically center the map fitting all markers on the screen
                        map.fitBounds(bounds)
                    }
                }
            }

            // Listen for the event fired when the user selects a prediction and retrieve
            // more details for that place.
            searchBox.addListener('places_changed', () => {
                const places = searchBox.getPlaces()
                bounds = new google.maps.LatLngBounds()

                if (places.length === 0) return

                // For each place, get the icon, name and location.
                places.forEach((place) => {
                    if (!place.geometry) {
                        console.log('Returned place contains no geometry')
                        return
                    }
                    if (place.geometry.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport)
                    } else {
                        bounds.extend(place.geometry.location)
                    }
                })
                map.fitBounds(bounds)
            })

            // GEOLOCATION - Set bounds to include current location
            /**
            if (navigator.geolocation) {
                let initialLocation
                navigator.geolocation.getCurrentPosition((position) => {
                    if (position && position.coords) {
                        initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        // map.setCenter(initialLocation);
                        // map.setZoom(12);
                        bounds.extend(initialLocation);
                        map.fitBounds(bounds);
                    }
                });
            }
            **/
        }

        if (document.getElementById('mapsApiScript')) {
            document.body.removeChild(document.getElementById('mapsApiScript'))
        }

        const theScript = document.createElement('script')
        theScript.id = 'mapsApiScript'
        theScript.src = `https://maps.googleapis.com/maps/api/js?key=${(<any>AppConfig).google_maps_api_key}&libraries=places&callback=initGoogleMapsSiteLocator`
        document.body.appendChild(theScript)

    }

}
