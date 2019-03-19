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

export class Polygon {
    constructor(map) {
        this.map = map;
        this.latlngs = [];
        this.polygon = null;
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
                this.polygon = L.polygon(latlngs, { color: option.color, weight: option.weight });
            } else {
                this.polygon = L.polygon(latlngs);
            }
            this.polygon.addTo(this.map);
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
            that.map.on('dblclick', doubleClickEvent);
        };
        const tempLatlngList = [];
        const tempPolyline = null;
        const dragIndex = -1;
        let dragStartEvent = function (e) {
            dragIndex = that._dragMarkerIndex(e.target);
            tempLatlngList.length = 0;
            let f = dragIndex === 0 ? (that.dragMarkerList.length - 1) : dragIndex - 1;
            let t = dragIndex === (that.dragMarkerList.length - 1) ? 0 : dragIndex + 1;
            tempLatlngList.push(that.dragMarkerList[t].getLatLng());
            tempLatlngList.push(that.dragMarkerList[dragIndex].getLatLng());
            tempLatlngList.push(that.dragMarkerList[f].getLatLng());
            if (tempPolyline) tempPolyline.remove();
            tempPolyline = L.polyline(tempLatlngList, { color: 'blue', dashArray: 5 });
            tempPolyline.addTo(that.map);
        };
        let dragEvent = function (e) {
            let latlng = that.dragMarkerList[dragIndex].getLatLng();
            tempLatlngList[1] = latlng;
            if (that.okMarker) {
                that.okMarker.setLatLng(latlng);
                that.cancelMarker.setLatLng(latlng);
            }
            tempPolyline.setLatLngs(tempLatlngList);
        };
        let dragEndEvent = function (e) {
            let latlng = that.dragMarkerList[dragIndex].getLatLng();
            that.latlngs[dragIndex] = [latlng.lat, latlng.lng];
            that.polygon.setLatLngs(that.latlngs);
            that.tempPolyline.remove();
            that.dragged = true;
            setTimeout(function () { that.dragged = false; }, 200);
        };
        let clickEvent = function (e) {
            if (that.dragged) return;
            if (that.latlngs.length > 0) {
                if (that.latlngs[that.latlngs.length - 1] === [e.latlng.lat, e.latlng.lng]) {
                    return false;
                }
            }
            that.latlngs.push([
                e.latlng.lat,
                e.latlng.lng,
            ]);
            let dragMarker = L.marker(e.latlng, { icon: that.dragIcon, draggable: true });
            dragMarker.on('dragstart', dragStartEvent);
            dragMarker.on('drag', dragEvent);
            dragMarker.on('dragend', dragEndEvent);
            dragMarker.addTo(that.map);
            that.dragMarkerList.push(dragMarker);
            if (that.latlngs.length === 3) {
                that.polygon = L.polygon(that.latlngs, { color: 'red' });
                that.polygon.addTo(that.map);
            } else if (that.latlngs.length > 3) {
                that.polygon.setLatLngs(that.latlngs);
            }
        };
        let doubleClickEvent = function (e) {
            clickEvent(e);
            that.okMarker = L.marker(e.latlng, { icon: that.okIcon });
            that.cancelMarker = L.marker(e.latlng, { icon: that.cancelIcon });

            that.okMarker.on('click', okClickEvent);
            that.cancelMarker.on('click', cancelClickEvent);

            that.okMarker.addTo(that.map);
            that.cancelMarker.addTo(that.map);

            that.map.off('click', clickEvent);
            that.map.off('dblclick', doubleClickEvent);
        };
        that.map.on('click', clickEvent);
        that.map.on('dblclick', doubleClickEvent);
    }
    /**
     * 编辑
     * @param {*} latlngs 
     * @param {*} cb 
     */
    edit(latlngs, cb) {
        if (latlngs.length < 3) return;
        let that = this;
        let okClickEvent = function (e) {
            if (cb) {
                cb(that.latlngs);
            }
            that.remove();
        };
        let cancelClickEvent = function (e) {
            that.remove();
        };
        const tempLatlngList = [];
        const tempPolyline = null;
        const dragIndex = -1;
        let dragStartEvent = function (e) {
            dragIndex = that._dragMarkerIndex(e.target);
            tempLatlngList.length = 0;
            let f = dragIndex === 0 ? (that.dragMarkerList.length - 1) : dragIndex - 1;
            let t = dragIndex === (that.dragMarkerList.length - 1) ? 0 : dragIndex + 1;
            tempLatlngList.push(that.dragMarkerList[t].getLatLng());
            tempLatlngList.push(that.dragMarkerList[dragIndex].getLatLng());
            tempLatlngList.push(that.dragMarkerList[f].getLatLng());
            if (tempPolyline) tempPolyline.remove();
            tempPolyline = L.polyline(tempLatlngList, { color: 'blue', dashArray: 5 });
            tempPolyline.addTo(that.map);
        };
        let dragEvent = function (e) {
            let latlng = that.dragMarkerList[dragIndex].getLatLng();
            tempLatlngList[1] = latlng;
            if (that.okMarker) {
                that.okMarker.setLatLng(latlng);
                that.cancelMarker.setLatLng(latlng);
            }
            tempPolyline.setLatLngs(tempLatlngList);
        };
        let dragEndEvent = function (e) {
            let latlng = that.dragMarkerList[dragIndex].getLatLng();
            that.latlngs[dragIndex] = [latlng.lat, latlng.lng];
            that.polygon.setLatLngs(that.latlngs);
            that.tempPolyline.remove();
            that.dragged = true;
            setTimeout(function () { that.dragged = false; }, 200);
        };
        let clickEvent = function (e) {
            if (that.dragged) return;
            if (that.latlngs.length > 0) {
                if (that.latlngs[that.latlngs.length - 1] === [e.latlng.lat, e.latlng.lng]) {
                    return false;
                }
            }
            that.latlngs.push([
                e.latlng.lat,
                e.latlng.lng,
            ]);
            let dragMarker = L.marker(e.latlng, { icon: that.dragIcon, draggable: true });
            dragMarker.on('dragstart', dragStartEvent);
            dragMarker.on('drag', dragEvent);
            dragMarker.on('dragend', dragEndEvent);
            dragMarker.addTo(that.map);
            that.dragMarkerList.push(dragMarker);
            if (that.latlngs.length === 3) {
                that.polygon = L.polygon(that.latlngs, { color: 'red' });
                that.polygon.addTo(that.map);
            } else if (that.latlngs.length > 3) {
                that.polygon.setLatLngs(that.latlngs);
            }
        };
        let doubleClickEvent = function (e) {
            clickEvent(e);
            that.okMarker = L.marker(e.latlng, { icon: that.okIcon });
            that.cancelMarker = L.marker(e.latlng, { icon: that.cancelIcon });

            that.okMarker.on('click', okClickEvent);
            that.cancelMarker.on('click', cancelClickEvent);

            that.okMarker.addTo(that.map);
            that.cancelMarker.addTo(that.map);

            that.map.off('click', clickEvent);
            that.map.off('dblclick', doubleClickEvent);
        };
        that.map.on('click', clickEvent);
        that.map.on('dblclick', doubleClickEvent);
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
        if (this.polygon !== null) {
            this.polygon.remove();
        }
    }
    _dragMarkerIndex(obj) {
        return this.dragMarkerList.findIndex((v, i, o) => {
            return v === obj;
        });
    }
}