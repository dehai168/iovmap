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
'use strict'
import L from 'leaflet';
import proj4leaflet from "proj4leaflet";
import 'leaflet/dist/leaflet.css';

export class Map {
    /**
     * 初始化地图
     * @param {String} domid   标签元素id
     * @param {Object} options 地图参数
     */
    constructor(domid, options) {
        this.type = options.type;
        this.object = null;
        this.zoom = options.zoom ? options.zoom : 5;
        this.zoomControl = false;
        this.center = options.center ? options.center : [34.161818, 106.523438];
        let mapLayer = null;
        switch (this.type) {
            case "BMap":
                let crs = new L.Proj.CRS(
                    "EPSG:3395",
                    "+proj=merc +lon_0=0 +k=1 +x_0=140 +y_0=-250 +datum=WGS84 +units=m +no_defs",
                    {
                        resolutions: (function () {
                            let level = 19;
                            let res = [];
                            res[0] = Math.pow(2, 18);
                            for (let i = 1; i < level; i++) {
                                res[i] = Math.pow(2, 18 - i);
                            }
                            return res;
                        })(),
                        origin: [0, 0],
                        bounds: L.bounds([20037508.342789244, 0], [0, 20037508.342789244])
                    }
                );
                mapLayer = new L.tileLayer(
                    "https://ss{s}.bdstatic.com/8bo_dTSlR1gBo1vgoIiO_jowehsv/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&udt=20190125&scaler=1",
                    {
                        maxZoom: 18,
                        minZoom: 5,
                        subdomains: [0, 1, 2, 3],
                        attribution: "ⓒ 2012 Daum",
                        tms: true
                    }
                );
                this.object = new L.map(domid, { crs: crs, zoomControl: this.zoomControl });
                break;
            default:
                this.object = new L.map(domid, { zoomControl: this.zoomControl });
                mapLayer = new L.tileLayer(
                    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
                    {
                        maxZoom: 18,
                        attribution:
                            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                        id: "mapbox.streets"
                    }
                );
                break;
        }
        this.object.addControl(L.control.zoom({ position: "topright" }));
        this.object.addLayer(mapLayer);
        this.object.setView(this.center, this.zoom);
    }
    /**
     * 修改地图
     * @param {Number} zoom 
     */
    setZoom(zoom) {
        if(typeof zoom==='string'){
            zoom=parseInt(zoom);
        }
        this.object.setZoom(zoom);
    }
    /**
     * 移动地图
     * @param {array} point 
     */
    panTo(point){
        if(typeof point==='array'){
            this.object.panTo(point);
        }
    }
}