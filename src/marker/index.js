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
export class Marker {
    constructor(map, lat, lng, imgPath, size, anchor, tip) {
        this.map = map;
        this.latlng = [lat, lng];
        let myIcon = L.icon({
            iconUrl: imgPath,
            iconSize: size,
            iconAnchor: anchor,
        });
        this.marker = L.marker(this.latlng, { icon: myIcon });
        this.marker.addTo(this.map);
        if (tip) {
            this.marker.bindTooltip(tip).openTooltip();
        }
    }
    /**
     * 改变icon图标
     * @param {string} imgPath 
     */
    change(imgPath) {
        let myIcon = L.icon({
            iconUrl: imgPath,
        });
        this.marker.setIcon(myIcon);
    }
    /**
     * 移动
     * @param {*} lat 
     * @param {*} lng 
     */
    moveTo(lat, lng) {
        this.marker.setLatLng([lat, lng]);
    }
    /**
     * 移除
     */
    remove() {
        this.marker.remove();
    }
}