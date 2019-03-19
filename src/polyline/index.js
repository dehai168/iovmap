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

export class Polyline {
    constructor(map) {
        this.map = map;
        this.latlngs = [];
        this.polyline = null;
        this.polylines = [];
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
                this.polyline = L.polyline(latlngs, { color: option.color, weight: option.weight });
            } else {
                this.polyline = L.polyline(latlngs);
            }
            this.polyline.addTo(this.map);
        }
    }
    /**
     * 加载多媒体轨迹
     * @param {*} trackArray 
     */
    loadTrack(trackArray) {
        let that = this;
        let _draw = function (latlngArray, color) {
            if (latlngArray.length > 0) {
                let polyline = L.polyline(latlngArray, { color: color, weight: 5 });
                polyline.addTo(that.map);
                that.polylines.push(polyline);
            }
        };
        if (trackArray.length < 2) return;
        let first = trackArray[0];
        let color = that._getColor(first.speed);
        let latlngArray = [];
        latlngArray.push([first.lat, first.lng]);
        for (let index = 1; index < trackArray.length; index++) {
            let ele = trackArray[index];
            let tempColor = that._getColor(ele.speed);
            latlngArray.push([ele.lat, ele.lng]);
            if (color !== tempColor) {
                latlngArray.push([ele.lat, ele.lng]);
                _draw(latlngArray, color);
                latlngArray.length = 0;
                color = tempColor;
                index = index - 1;
            }
        }
        _draw(latlngArray, color);
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
        let tempLatlngList = [];
        let tempPolyline = null;
        let dragIndex = -1;
        let dragStartEvent = function (e) {
            dragIndex = that._dragMarkerIndex(e.target);
            tempLatlngList.length = 0;
            if (dragIndex === 0) {
                tempLatlngList.push(that.dragMarkerList[0].getLatLng());
                tempLatlngList.push(that.dragMarkerList[1].getLatLng());
            } else if (dragIndex === that.dragMarkerList.length - 1) {
                let f = dragIndex - 1;
                tempLatlngList.push(that.dragMarkerList[f].getLatLng());
                tempLatlngList.push(that.dragMarkerList[dragIndex].getLatLng());
            } else {
                let f = dragIndex - 1;
                let t = dragIndex + 1;
                tempLatlngList.push(that.dragMarkerList[f].getLatLng());
                tempLatlngList.push(that.dragMarkerList[dragIndex].getLatLng());
                tempLatlngList.push(that.dragMarkerList[t].getLatLng());
            }
            tempPolyline = L.polyline(tempLatlngList, { color: 'blue', dashArray: 5 });
            tempPolyline.addTo(that.map);
        };
        let dragEvent = function (e) {
            let latlng = that.dragMarkerList[dragIndex].getLatLng();
            if (dragIndex === 0) {
                tempLatlngList[0] = latlng;
            } else if (dragIndex === that.dragMarkerList.length - 1) {
                tempLatlngList[1] = latlng;
                if (that.okMarker) {
                    that.okMarker.setLatLng(latlng);
                    that.cancelMarker.setLatLng(latlng);
                }
            } else {
                tempLatlngList[1] = latlng;
            }
            tempPolyline.setLatLngs(tempLatlngList);
        };
        let dragEndEvent = function (e) {
            let latlng = that.dragMarkerList[dragIndex].getLatLng();
            tempPolyline.remove();
            that.latlngs[dragIndex] = [latlng.lat, latlng.lng];
            that.polyline.setLatLngs(that.latlngs);
            that.dragged = true;
            setTimeout(function () { that.dragged = false; }, 200);
        };
        let clickEvent = function (e) {
            if (that.dragged) return;
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
            if (that.latlngs.length === 2) {
                that.polyline = L.polyline(that.latlngs, { color: 'red' });
                that.polyline.addTo(that.map);
            } else if (that.latlngs.length > 2) {
                that.polyline.setLatLngs(that.latlngs);
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
     */
    edit(latlngs, cb) {
        if (latlngs.length < 2) return;
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
        let tempLatlngList = [];
        let tempPolyline = null;
        let dragIndex = -1;
        let dragStartEvent = function (e) {
            dragIndex = that._dragMarkerIndex(e.target);
            tempLatlngList.length = 0;
            if (dragIndex === 0) {
                tempLatlngList.push(that.dragMarkerList[0].getLatLng());
                tempLatlngList.push(that.dragMarkerList[1].getLatLng());
            } else if (dragIndex === that.dragMarkerList.length - 1) {
                let f = dragIndex - 1;
                tempLatlngList.push(that.dragMarkerList[f].getLatLng());
                tempLatlngList.push(that.dragMarkerList[dragIndex].getLatLng());
            } else {
                let f = dragIndex - 1;
                let t = dragIndex + 1;
                tempLatlngList.push(that.dragMarkerList[f].getLatLng());
                tempLatlngList.push(that.dragMarkerList[dragIndex].getLatLng());
                tempLatlngList.push(that.dragMarkerList[t].getLatLng());
            }
            if (tempPolyline) tempPolyline.remove();
            tempPolyline = L.polyline(tempLatlngList, { color: 'blue', dashArray: 5 });
            tempPolyline.addTo(that.map);
        };
        let dragEvent = function (e) {
            let latlng = that.dragMarkerList[dragIndex].getLatLng();
            if (dragIndex === 0) {
                tempLatlngList[0] = latlng;
            } else if (dragIndex === that.dragMarkerList.length - 1) {
                tempLatlngList[1] = latlng;
                if (that.okMarker) {
                    that.okMarker.setLatLng(latlng);
                    that.cancelMarker.setLatLng(latlng);
                }
            } else {
                tempLatlngList[1] = latlng;
            }
            tempPolyline.setLatLngs(tempLatlngList);
        };
        let dragEndEvent = function (e) {
            let latlng = that.dragMarkerList[dragIndex].getLatLng();
            that.latlngs[dragIndex] = [latlng.lat, latlng.lng];
            that.polyline.setLatLngs(that.latlngs);
            tempPolyline.remove();
        };
        let i = 0;
        that.latlngs.forEach(element => {
            let latlng = [element[0], element[1]];
            let dragMarker = L.marker(latlng, { icon: that.dragIcon, draggable: true });
            dragMarker.on('dragstart', dragStartEvent);
            dragMarker.on('drag', dragEvent);
            dragMarker.on('dragend', dragEndEvent);
            dragMarker.addTo(that.map);
            that.dragMarkerList.push(dragMarker);
            if (i === that.latlngs.length - 1) {
                that.okMarker = L.marker(latlng, { icon: that.okIcon });
                that.cancelMarker = L.marker(latlng, { icon: that.cancelIcon });

                that.okMarker.on('click', okClickEvent);
                that.cancelMarker.on('click', cancelClickEvent);

                that.okMarker.addTo(that.map);
                that.cancelMarker.addTo(that.map);
            }
            i++;
        });
        that.polyline = L.polyline(that.latlngs, { color: 'red' });
        that.polyline.addTo(that.map);
    }
    /**
     * 移除
     */
    remove() {
        this.latlngs.length = 0;
        while (this.polylines.length > 0) {
            let element = this.polylines.shift();
            element.remove();
        }
        while (this.dragMarkerList.length > 0) {
            let element = this.dragMarkerList.shift();
            element.remove();
        }
        if (this.polyline !== null) {
            this.polyline.remove();
        }
        if (this.okMarker) {
            this.okMarker.remove();
        }
        if (this.cancelMarker) {
            this.cancelMarker.remove();
        }
    }
    /**
     * 获取颜色
     * @param {number} speed 
     */
    _getColor(speed) {
        if (speed <= 60) {
            return '#228B22';
        } else if (speed <= 80) {
            return '#FF8C00';
        } else {
            return '#FF0000';
        }
    }
    _dragMarkerIndex(obj) {
        return this.dragMarkerList.findIndex((v, i, o) => {
            return v === obj;
        });
    }
}