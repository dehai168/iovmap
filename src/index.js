import { Map } from './map/index'
import { Marker } from './marker/index'
import { MarkerList } from "./markerlist/index";
import { Polyline } from './polyline/index';
import { Draw } from './draw/index';

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