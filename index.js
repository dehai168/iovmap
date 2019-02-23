import { Map } from './src/map/index'
import { Marker } from './src/marker/index'
import { MarkerList } from "./src/markerlist/index";
import { Polyline } from './src/polyline/index';
import { Draw } from './src/draw/index';

import L from 'leaflet';
import proj4leaflet from "proj4leaflet";
import 'leaflet/dist/leaflet.css';

const IOVMap = {
    Map,
    Marker,
    MarkerList,
    Polyline,
    Draw,
};
export {
    IOVMap
};