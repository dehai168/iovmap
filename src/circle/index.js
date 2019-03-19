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
import redIcon from "../assets/redicon.png";

export class Circle {
    constructor(map) {
        this.map = map;
        this.latlng = [];
        this.circle = null;
        this.radius = 5000;
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
        this.markerIcon = L.icon({
            iconUrl: redIcon,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });
    }
    /**
     * 加载
     * @param {*} latlng 
     * @param {*} option 
     */
    load(latlng, radius, option) {
        if (latlng.length > 0) {
            if (option) {
                this.circle = L.circle(latlng, { radius: radius, color: option.color, weight: option.weight });
            } else {
                this.circle = L.circle(latlng, { radius: radius });
            }
            this.circle.addTo(this.map);
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
                cb(that.latlng, that.radius);
            }
            that.remove();
        };
        let cancelClickEvent = function (e) {
            that.remove();
            that.map.on('click', clickEvent);
        };
        let dragEvent1 = function (e) {
            let dragIndex = that._dragMarkerIndex(e.target);
            let latlng = that.dragMarkerList[dragIndex].getLatLng();

            that.okMarker.setLatLng(latlng);
            that.cancelMarker.setLatLng(latlng);
            that.circle.setLatLng(latlng);

            let bounds = that.circle.getBounds();
            let sw = bounds.getSouthWest();
            let se = bounds.getSouthEast();
            that.dragMarkerList[1].setLatLng([sw.lat, (se.lng + sw.lng) / 2]);
        };
        let dragEvent2 = function (e) {
            let dragIndex = that._dragMarkerIndex(e.target);
            let latlng = that.dragMarkerList[0].getLatLng();
            let latlng2 = that.dragMarkerList[dragIndex].getLatLng();
            that.radius = latlng.distanceTo(latlng2);
            that.circle.setRadius(that.radius);
        };
        let clickEvent = function (e) {
            that.latlng.push([
                e.latlng.lat,
                e.latlng.lng,
            ]);
            let marker1 = L.marker(e.latlng, { icon: that.markerIcon, draggable: true });
            marker1.on('drag', dragEvent1);
            marker1.addTo(that.map);
            that.dragMarkerList.push(marker1);
            that.circle = L.circle(e.latlng, { radius: that.radius });
            that.circle.addTo(that.map);
            let bounds = that.circle.getBounds();
            let sw = bounds.getSouthWest();
            let se = bounds.getSouthEast();
            let marker2 = L.marker([sw.lat, (se.lng + sw.lng) / 2], { icon: that.dragIcon, draggable: true });
            marker2.on('drag', dragEvent2);
            marker2.addTo(that.map);
            that.dragMarkerList.push(marker2);

            that.okMarker = L.marker(e.latlng, { icon: that.okIcon });
            that.cancelMarker = L.marker(e.latlng, { icon: that.cancelIcon });

            that.okMarker.on('click', okClickEvent);
            that.cancelMarker.on('click', cancelClickEvent);

            that.okMarker.addTo(that.map);
            that.cancelMarker.addTo(that.map);

            that.map.off('click', clickEvent);
            that.map.panTo(e.latlng);
        };
        that.map.on('click', clickEvent);
    }
    /**
     * 编辑
     */
    edit(latlng, radius, cb) {
        let that = this;
        that.latlng = latlng;
        that.radius = radius;
        let okClickEvent = function (e) {
            if (cb) {
                cb(that.latlng, that.radius);
            }
            that.remove();
        };
        let cancelClickEvent = function (e) {
            that.remove();
        };
        let dragEvent1 = function (e) {
            let dragIndex = that._dragMarkerIndex(e.target);
            let latlng = that.dragMarkerList[dragIndex].getLatLng();

            that.okMarker.setLatLng(latlng);
            that.cancelMarker.setLatLng(latlng);
            that.circle.setLatLng(latlng);

            let bounds = that.circle.getBounds();
            let sw = bounds.getSouthWest();
            let se = bounds.getSouthEast();
            that.dragMarkerList[1].setLatLng([sw.lat, (se.lng + sw.lng) / 2]);
        };
        let dragEvent2 = function (e) {
            let dragIndex = that._dragMarkerIndex(e.target);
            let latlng = that.dragMarkerList[0].getLatLng();
            let latlng2 = that.dragMarkerList[dragIndex].getLatLng();
            that.radius = latlng.distanceTo(latlng2);
            that.circle.setRadius(that.radius);
        };
        let marker1 = L.marker(that.latlng, { icon: that.markerIcon, draggable: true });
        marker1.on('drag', dragEvent1);
        marker1.addTo(that.map);
        that.dragMarkerList.push(marker1);
        that.circle = L.circle(that.latlng, { radius: that.radius });
        that.circle.addTo(that.map);
        let bounds = that.circle.getBounds();
        let sw = bounds.getSouthWest();
        let se = bounds.getSouthEast();
        let marker2 = L.marker([sw.lat, (se.lng + sw.lng) / 2], { icon: that.dragIcon, draggable: true });
        marker2.on('drag', dragEvent2);
        marker2.addTo(that.map);
        that.dragMarkerList.push(marker2);

        that.okMarker = L.marker(that.latlng, { icon: that.okIcon });
        that.cancelMarker = L.marker(that.latlng, { icon: that.cancelIcon });

        that.okMarker.on('click', okClickEvent);
        that.cancelMarker.on('click', cancelClickEvent);

        that.okMarker.addTo(that.map);
        that.cancelMarker.addTo(that.map);
        that.map.panTo(that.latlng);
    }
    /**
     * 移除
     */
    remove() {
        this.latlng.length = 0;
        while (this.dragMarkerList.length > 0) {
            let element = this.dragMarkerList.shift();
            element.remove();
        }
        if (this.circle !== null) {
            this.circle.remove();
        }
        if (this.okMarker) {
            this.okMarker.remove();
        }
        if (this.cancelMarker) {
            this.cancelMarker.remove();
        }
    }
    _dragMarkerIndex(obj) {
        return this.dragMarkerList.findIndex((v, i, o) => {
            return v === obj;
        });
    }
}