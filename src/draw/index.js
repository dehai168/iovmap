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
        this.radius = 5000;
        this.dragged = false;
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
                that.tempLatlngList.push(that.markerList[0].getLatLng());
                that.tempLatlngList.push(that.markerList[1].getLatLng());
            } else if (dragIndex === that.markerList.length - 1) {
                that.tempLatlngList.push(that.markerList[--dragIndex].getLatLng());
                that.tempLatlngList.push(that.markerList[dragIndex].getLatLng());
            } else {
                let f = dragIndex - 1;
                let t = dragIndex + 1;
                that.tempLatlngList.push(that.markerList[f].getLatLng());
                that.tempLatlngList.push(that.markerList[dragIndex].getLatLng());
                that.tempLatlngList.push(that.markerList[t].getLatLng());
            }
            that.tempPath = L.polyline(that.tempLatlngList, { color: 'blue', dashArray: 5 });
            that.tempPath.addTo(that.map);
        };
        let dragEvent = function (e) {
            let dragIndex = that._markerListIndex(e.target);
            let latlng = that.markerList[dragIndex].getLatLng();
            if (dragIndex === 0) {
                that.tempLatlngList[0] = latlng;
            } else if (dragIndex === that.markerList.length - 1) {
                that.tempLatlngList[1] = latlng;
                if (that.okMarker) {
                    that.okMarker.setLatLng([latlng.lat, latlng.lng]);
                    that.cancelMarker.setLatLng([latlng.lat, latlng.lng]);
                }
            } else {
                that.tempLatlngList[1] = latlng;
            }
            that.tempPath.setLatLngs(that.tempLatlngList);
        };
        let dragEndEvent = function (e) {
            let dragIndex = that._markerListIndex(e.target);
            let temp = that.markerList[dragIndex].getLatLng();
            that.latlngList[dragIndex] = [temp.lat, temp.lng];
            that.path.setLatLngs(that.latlngList);
            that.tempPath.remove();
            that.dragged = true;
            setTimeout(function () { that.dragged = false; }, 200);
        };
        let clickEvent = function (e) {
            if (that.dragged) return;
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
    /**
     * 绘制矩形
     * @param {*} latlngArray 
     */
    drawRectangle(latlngArray) {
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
        };
        let dragEvent = function (e) {
            let dragIndex = that._markerListIndex(e.target);
            let latlng = that.markerList[dragIndex].getLatLng();
            if (dragIndex === 0) {
                that.latlngList[0] = [latlng.lat, latlng.lng];
            } else {
                that.latlngList[1] = [latlng.lat, latlng.lng];
                that.okMarker.setLatLng([latlng.lat, latlng.lng]);
                that.cancelMarker.setLatLng([latlng.lat, latlng.lng]);
            }
            that.path.setBounds(that.latlngList);
        };
        let clickEvent = function (e) {
            that.latlngList.push([
                e.latlng.lat,
                e.latlng.lng,
            ]);
            let marker = L.marker(e.latlng, { icon: that.dragIcon, draggable: true });
            marker.on('drag', dragEvent);
            marker.addTo(that.map);
            that.markerList.push(marker);
            if (that.latlngList.length === 2) {
                that.path = L.rectangle(that.latlngList, { color: 'red' });
                that.path.addTo(that.map);
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
     * 绘制多边形
     * @param {*} latlngArray 
     */
    drawPolygon(latlngArray) {
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
            let f = dragIndex === 0 ? (that.markerList.length - 1) : dragIndex - 1;
            let t = dragIndex === (that.markerList.length - 1) ? 0 : dragIndex + 1;
            that.tempLatlngList.push(that.markerList[t].getLatLng());
            that.tempLatlngList.push(that.markerList[dragIndex].getLatLng());
            that.tempLatlngList.push(that.markerList[f].getLatLng());
            if (that.tempPath) that.tempPath.remove();
            that.tempPath = L.polyline(that.tempLatlngList, { color: 'blue', dashArray: 5 });
            that.tempPath.addTo(that.map);
        };
        let dragEvent = function (e) {
            let dragIndex = that._markerListIndex(e.target);
            let latlng = that.markerList[dragIndex].getLatLng();
            that.tempLatlngList[1] = latlng;
            if (that.okMarker) {
                that.okMarker.setLatLng([latlng.lat, latlng.lng]);
                that.cancelMarker.setLatLng([latlng.lat, latlng.lng]);
            }
            that.tempPath.setLatLngs(that.tempLatlngList);
        };
        let dragEndEvent = function (e) {
            let dragIndex = that._markerListIndex(e.target);
            let temp = that.markerList[dragIndex].getLatLng();
            that.latlngList[dragIndex] = [temp.lat, temp.lng];
            that.path.setLatLngs(that.latlngList);
            that.tempPath.remove();
            that.dragged = true;
            setTimeout(function () { that.dragged = false; }, 200);
        };
        let clickEvent = function (e) {
            if (that.dragged) return;
            if (that.latlngList.length > 0) {
                if (that.latlngList[that.latlngList.length - 1] === [e.latlng.lat, e.latlng.lng]) {
                    return false;
                }
            }
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
            if (that.latlngList.length === 3) {
                that.path = L.polygon(that.latlngList, { color: 'red' });
                that.path.addTo(that.map);
            } else if (that.latlngList.length > 3) {
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
    /**
     * 绘制圆形
     * @param {*} latlng 
     * @param {*} radius 
     */
    drawCircle(latlng, radius) {
        let that = this;
        let okClickEvent = function (e) {
            let temp = that.latlngList;
            if (that.cb) {
                that.cb(temp[0],radius);
            }
            that.remove();
        };
        let cancelClickEvent = function (e) {
            that.remove();
            that.map.on('click', clickEvent);
        };
        let dragEvent1 = function (e) {
            let dragIndex = that._markerListIndex(e.target);
            let latlng = that.markerList[dragIndex].getLatLng();

            that.okMarker.setLatLng([latlng.lat, latlng.lng]);
            that.cancelMarker.setLatLng([latlng.lat, latlng.lng]);
            that.path.setLatLng([latlng.lat, latlng.lng]);

            let bounds = that.path.getBounds();
            let sw = bounds.getSouthWest();
            let se = bounds.getSouthEast();
            that.markerList[1].setLatLng([sw.lat, (se.lng + sw.lng) / 2]);
        };
        let dragEvent2 = function (e) {
            let dragIndex = that._markerListIndex(e.target);
            let latlng = that.markerList[0].getLatLng();
            let latlng2 = that.markerList[dragIndex].getLatLng();
            let radius = latlng.distanceTo(latlng2);
            that.radius = radius;
            that.path.setRadius(radius);
        };
        let clickEvent = function (e) {
            that.latlngList.push([
                e.latlng.lat,
                e.latlng.lng,
            ]);
            let marker1 = L.marker(e.latlng, { icon: that.markerIcon, draggable: true });
            marker1.on('drag', dragEvent1);
            marker1.addTo(that.map);
            that.markerList.push(marker1);
            that.path = L.circle(e.latlng, { radius: that.radius });
            that.path.addTo(that.map);
            let bounds = that.path.getBounds();
            let sw = bounds.getSouthWest();
            let se = bounds.getSouthEast();
            let marker2 = L.marker([sw.lat, (se.lng + sw.lng) / 2], { icon: that.dragIcon, draggable: true });
            marker2.on('drag', dragEvent2);
            marker2.addTo(that.map);
            that.markerList.push(marker2);

            that.okMarker = L.marker(e.latlng, { icon: that.okIcon });
            that.cancelMarker = L.marker(e.latlng, { icon: that.cancelIcon });

            that.okMarker.on('click', okClickEvent);
            that.cancelMarker.on('click', cancelClickEvent);

            that.okMarker.addTo(that.map);
            that.cancelMarker.addTo(that.map);

            that.map.off('click', clickEvent);
            that.map.panTo(e.latlng);
            that.map.setZoom(12);
        };
        that.map.on('click', clickEvent);
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