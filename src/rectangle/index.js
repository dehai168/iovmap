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
import polygon from "../assets/polygon.png";

export class Rectangle {
    constructor(map) {
        this.map = map;
        this.latlngs = [];
        this.rectangle = null;
        this.dragMarkerList = [];

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
        this.dragIcon = L.icon({
            iconUrl: polygon,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
        });
    }
    /**
     * 加载
     * @param {*} latlngs 
     * @param {*} option 
     */
    load(latlngs, option) {
        if (latlngs.length > 0) {
            if (option) {
                this.rectangle = L.rectangle(latlngs, { color: option.color, weight: option.weight });
            } else {
                this.rectangle = L.rectangle(latlngs);
            }
            this.rectangle.addTo(this.map);
        }
    }
    /**
     * 绘制
     * @param {*} cb 
     */
    draw(cb) {
        let that = this;
        let okClickEvent = function (e) {
            if (cb) {
                cb(that.latlngs);
            }
            that.remove();
        };
        let cancelClickEvent = function (e) {
            that.remove();
            that.map.on('click', clickEvent);
        };
        let dragEvent = function (e) {
            let dragIndex = that._markerListIndex(e.target);
            let latlng = that.dragMarkerList[dragIndex].getLatLng();
            if (dragIndex === 0) {
                that.latlngs[0] = [latlng.lat, latlng.lng];
            } else {
                that.latlngs[1] = [latlng.lat, latlng.lng];
                that.okMarker.setLatLng(latlng);
                that.cancelMarker.setLatLng(latlng);
            }
            that.rectangle.setBounds(that.latlngs);
        };
        let clickEvent = function (e) {
            that.latlngs.push([
                e.latlng.lat,
                e.latlng.lng,
            ]);
            let dragMarker = L.marker(e.latlng, { icon: that.dragIcon, draggable: true });
            dragMarker.on('drag', dragEvent);
            dragMarker.addTo(that.map);
            that.dragMarkerList.push(dragMarker);
            if (that.latlngs.length === 2) {
                that.rectangle = L.rectangle(that.latlngs, { color: 'red' });
                that.rectangle.addTo(that.map);
                that.map.off('click', clickEvent);

                that.okMarker = L.marker(e.latlng, { icon: that.okIcon });
                that.cancelMarker = L.marker(e.latlng, { icon: that.cancelIcon });

                that.okMarker.on('click', okClickEvent);
                that.cancelMarker.on('click', cancelClickEvent);

                that.okMarker.addTo(that.map);
                that.cancelMarker.addTo(that.map);
            }
        };
        that.map.on('click', clickEvent);
    }
    /**
     * 编辑
     * @param {*} latlngs 
     * @param {*} cb 
     */
    edit(latlngs, cb) {
        if (latlngs.length !== 2) return;
        let that = this;
        that.latlngs = latlngs;
        let okClickEvent = function (e) {
            if (cb) {
                cb(that.latlngs);
            }
            that.remove();
        };
        let cancelClickEvent = function (e) {
            that.remove();
        };
        let dragEvent = function (e) {
            let dragIndex = that._markerListIndex(e.target);
            let latlng = that.dragMarkerList[dragIndex].getLatLng();
            if (dragIndex === 0) {
                that.latlngs[0] = [latlng.lat, latlng.lng];
            } else {
                that.latlngs[1] = [latlng.lat, latlng.lng];
                that.okMarker.setLatLng(latlng);
                that.cancelMarker.setLatLng(latlng);
            }
            that.rectangle.setBounds(that.latlngs);
        };
        that.latlngs.forEach(latlng => {
            let dragMarker = L.marker(latlng, { icon: that.dragIcon, draggable: true });
            dragMarker.on('drag', dragEvent);
            dragMarker.addTo(that.map);
            that.dragMarkerList.push(dragMarker);
        });

        that.rectangle = L.rectangle(that.latlngs, { color: 'red' });
        that.rectangle.addTo(that.map);

        const latlng = that.latlngs[1];
        that.okMarker = L.marker(latlng, { icon: that.okIcon });
        that.cancelMarker = L.marker(latlng, { icon: that.cancelIcon });

        that.okMarker.on('click', okClickEvent);
        that.cancelMarker.on('click', cancelClickEvent);

        that.okMarker.addTo(that.map);
        that.cancelMarker.addTo(that.map);
    }
    /**
     * 移除
     */
    remove() {
        this.latlngs.length = 0;
        while (this.dragMarkerList.length > 0) {
            let element = this.dragMarkerList.shift();
            element.remove();
        }
        if (this.rectangle !== null) {
            this.rectangle.remove();
        }
    }
    _dragMarkerIndex(obj) {
        return this.dragMarkerList.findIndex((v, i, o) => {
            return v === obj;
        });
    }
}