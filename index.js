/*
 * Copyright (C) 2017 dehai.site All Rights Reserved.
 *
 * @author level <dehai168@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Map } from './src/map/index';
import { Marker } from './src/marker/index';
import { MarkerList } from "./src/markerlist/index";
import { MarkerList2 } from "./src/markerlist2/index";
import { Polyline } from './src/polyline/index';
import { Rectangle } from './src/rectangle/index';
import { Polygon } from './src/polygon/index';
import { Circle } from './src/circle/index';


import 'leaflet/dist/leaflet.css';

const IOVMap = {
    Map,
    Marker,
    MarkerList,
    MarkerList2,
    Polyline,
    Rectangle,
    Polygon,
    Circle,
};
export {
    IOVMap
};