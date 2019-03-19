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
import ok from "../assets/ok.png";
import cancel from "../assets/cancel.png";
import redIcon from "../assets/redicon.png";

export class Marker {
    constructor(map) {
        this.map = map;
        this.markerIcon = L.icon({
            iconUrl: redIcon,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });
        this.okIcon = L.icon({
            iconUrl: ok,
            iconSize: [12, 12],
            iconAnchor: [-12, 34],
        });
        this.cancelIcon = L.icon({
            iconUrl: cancel,
            iconSize: [12, 12],
            iconAnchor: [-12, 12],
        });
    }
    /**
     * 绘制
     * @param {*} cb 
     */
    draw(cb) {
        let that = this;
        let okClickEvent = function (e) {
            if (cb) {
                cb(that.latlng);
            }
            that.remove();
        };
        let cancelClickEvent = function (e) {
            that.remove();
            that.map.on('click', clickEvent);
        };
        let dragEvent = function (e) {
            let latlng = e.target.getLatLng();
            that.latlng = [latlng.lat, latlng.lng];
            that.okMarker.setLatLng(latlng);
            that.cancelMarker.setLatLng(latlng);
        };
        let clickEvent = function (e) {
            that.latlng = [e.latlng.lat, e.latlng.lng];
            // 绘制marker
            that.marker = L.marker(that.latlng, { icon: that.markerIcon, draggable: true });
            that.marker.addTo(that.map);
            that.marker.on('drag', dragEvent);
            // 确认marker
            that.okMarker = L.marker(that.latlng, { icon: that.okIcon });
            that.okMarker.on('click', okClickEvent);
            that.okMarker.addTo(that.map);
            // 取消marker
            that.cancelMarker = L.marker(that.latlng, { icon: that.cancelIcon });
            that.cancelMarker.on('click', cancelClickEvent);
            that.cancelMarker.addTo(that.map);
            // 注销事件
            that.map.off('click', clickEvent);
        };
        this.map.on('click', clickEvent);
    }
    edit(lat, lng, cb) {
        let that = this;
        that.latlng = [lat, lng];
        let okClickEvent = function (e) {
            if (cb) {
                cb(that.latlng);
            }
            that.remove();
        };
        let cancelClickEvent = function (e) {
            that.remove();
        };
        let dragEvent = function (e) {
            let latlng = e.target.getLatLng();
            that.latlng = [latlng.lat, latlng.lng];
            that.okMarker.setLatLng(latlng);
            that.cancelMarker.setLatLng(latlng);
        };
        // 绘制marker
        that.marker = L.marker(that.latlng, { icon: that.markerIcon, draggable: true });
        that.marker.addTo(that.map);
        that.marker.on('drag', dragEvent);
        // 确认marker
        that.okMarker = L.marker(that.latlng, { icon: that.okIcon });
        that.okMarker.on('click', okClickEvent);
        that.okMarker.addTo(that.map);
        // 取消marker
        that.cancelMarker = L.marker(that.latlng, { icon: that.cancelIcon });
        that.cancelMarker.on('click', cancelClickEvent);
        that.cancelMarker.addTo(that.map);
    }
    /**
     * 加载
     * @param {*} lat 
     * @param {*} lng 
     * @param {*} imgPath 
     * @param {*} size 
     * @param {*} anchor 
     * @param {*} tip 
     */
    load(lat, lng, imgPath, size, anchor, tip) {
        this.latlng = [lat, lng];
        if (imgPath) {
            let myIcon = L.icon({
                iconUrl: imgPath,
                iconSize: size,
                iconAnchor: anchor,
            });
            this.marker = L.marker(this.latlng, { icon: myIcon });
        } else {
            this.marker = L.marker(this.latlng);
        }
        this.marker.addTo(this.map);
        if (tip) {
            this.marker.bindTooltip(tip).openTooltip();
        }
    }
    /**
     * 改变icon图标
     * @param {string} imgPath 
     */
    change(imgPath, size, anchor) {
        if (imgPath) {
            let myIcon = L.icon({
                iconUrl: imgPath,
                iconSize: size,
                iconAnchor: anchor,
            });
            this.marker.setIcon(myIcon);
        }
    }
    /**
     * 移动
     * @param {*} lat 
     * @param {*} lng 
     */
    moveTo(lat, lng) {
        if (typeof lat === 'string') {
            lat = parseFloat(lat);
        }
        if (typeof lng === 'string') {
            lng = parseFloat(lng);
        }
        this.latlng = [lat, lng];
        if (this.marker) {
            this.marker.setLatLng(this.latlng);
        }
        if (this.okMarker) {
            this.okMarker.setLatLng(this.latlng);
        }
        if (this.cancelMarker) {
            this.cancelMarker.setLatLng(this.latlng);
        }
    }
    /**
     * 移除
     */
    remove() {
        if (this.marker) {
            this.marker.remove();
        }
        if (this.okMarker) {
            this.okMarker.remove();
        }
        if (this.cancelMarker) {
            this.cancelMarker.remove();
        }
    }
}