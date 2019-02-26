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
import cancel from "../assets/cancel.png";
import redIcon from "../assets/redicon.png";
import polygon from "../assets/polygon.png";
import polygon_tm from "../assets/polygon_tm.png";
import ok from "../assets/ok.png";

export class Draw {
    constructor(map, cb) {
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
        this.dragIcon = L.icon({
            iconUrl: polygon,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
        });
        this.dragTMIcon = L.icon({
            iconUrl: polygon_tm,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
        });
        this.markerList = [];
        this.latlngList = [];
        this.path = null;
        this.tempPath = null;
        this.tempLatlngList = [];
        this.cb = cb;
    }
    /**
     * 绘制标记
     */
    drawMarker() {
        let that = this;
        let okClickEvent = function (e) {
            let temp = that.latlngList[0];
            if (that.cb) {
                that.cb(temp);
            }
            that.remove();
        };
        let cancelClickEvent = function (e) {
            that.remove();
            that.map.on('click', clickEvent);
        };
        let clickEvent = function (e) {
            that.latlngList.push([e.latlng.lat, e.latlng.lng]);

            let marker = L.marker(e.latlng, { icon: that.markerIcon });
            that.okMarker = L.marker(e.latlng, { icon: that.okIcon });
            that.cancelMarker = L.marker(e.latlng, { icon: that.cancelIcon });
            that.okMarker.on('click', okClickEvent);
            that.cancelMarker.on('click', cancelClickEvent);

            marker.addTo(that.map);
            that.okMarker.addTo(that.map);
            that.cancelMarker.addTo(that.map);

            that.map.off('click', clickEvent);
            that.markerList.push(marker);
        };
        this.map.on('click', clickEvent);
    }
    /**
     * 绘制曲线
     * @param {array} latlngArray 
     */
    drawPolyline(latlngArray) {
        let that = this;
        let okClickEvent = function (e) {
            let temp = that.latlngList;
            if (that.cb) {
                that.cb(temp);
            }
            that.remove();
        };
        let cancelClickEvent = function (e) {
            that.remove();
            that.map.on('click', clickEvent);
            that.map.on('dblclick', doubleClickEvent);
        };
        let dragStartEvent = function (e) {
            let dragIndex = that._markerListIndex(e.target);
            that.tempLatlngList.length = 0;
            if (dragIndex === 0) {
                that.tempLatlngList.push(e.latlng);
                that.tempLatlngList.push(that.markerList[++dragIndex].getLatLng());
            }else if(dragIndex===that.markerList.length-1){
                that.tempLatlngList.push(that.markerList[--dragIndex].getLatLng());
                that.tempLatlngList.push(e.latlng);
            }else{
                that.tempLatlngList.push(that.markerList[--dragIndex].getLatLng());
                that.tempLatlngList.push(e.latlng);
                that.tempLatlngList.push(that.markerList[++dragIndex].getLatLng());
            }
            that.tempPath = L.polyline(that.tempLatlngList, { color: 'blue', dashArray: 5 });
            that.tempPath.addTo(that.map);
        };
        let dragEvent = function (e) {
            let dragIndex = that._markerListIndex(e.target);
            if (dragIndex === 0) {
                that.tempLatlngList[0] = e.latlng;
            } else if (dragIndex === that.markerList.length - 1) {
                that.tempLatlngList[1] = e.latlng;
            } else {
                that.tempLatlngList[1] = e.latlng;
            }
            that.tempPath.setLatLngs(that.tempLatlngList);
        };
        let dragEndEvent = function (e) {
            let dragIndex = that._markerListIndex(e.target);
            that.latlngList[dragIndex] = [e.latlng.lat, e.latlng.lng];
            that.path.setLatLngs(that.latlngList);
            that.tempPath.remove();
        };
        let clickEvent = function (e) {
            that.latlngList.push([
                e.latlng.lat,
                e.latlng.lng,
            ]);
            let marker = L.marker(e.latlng, { icon: that.dragIcon, draggable: true });
            marker.on('dragstart', dragStartEvent);
            marker.on('drag', dragEvent);
            marker.on('dragend', dragEndEvent);
            marker.addTo(that.map);
            that.markerList.push(marker);
            if (that.latlngList.length === 2) {
                that.path = L.polyline(that.latlngList, { color: 'red' });
                that.path.addTo(that.map);
            } else if (that.latlngList.length > 2) {
                that.path.setLatLngs(that.latlngList);
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
    drawPolygon(latlngArray) {

    }
    drawCircle(latlng, radius) {

    }
    /**
     * 移除
     */
    remove() {
        while (this.markerList.length > 0) {
            let element = this.markerList.shift();
            element.remove();
        }
        if (this.path) {
            this.path.remove();
        }
        this.latlngList.length = 0;
        this.okMarker.remove();
        this.cancelMarker.remove();
    }
    _markerListIndex(obj) {
        return this.markerList.findIndex((v, i, o) => {
            return v === obj;
        });
    }
}