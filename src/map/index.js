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
const map = Symbol('map')

export class Map {
    /**
     * 初始化地图
     * @param {String} domid   标签元素id
     * @param {Object} options 地图参数
     */
    constructor(domid, options) {
        let type = options.type ? options.type : '';
        let zoom = options.zoom ? options.zoom : 5;
        let center = options.center ? options.center : [34.161818, 106.523438];
        //地图部分
        let crs = this._getCRS(type);
        this.mapLayer = this._getLayer(type);
        let option = {
            crs: crs, zoomControl: false
        };
        if (crs === null) {
            delete option.crs;
        }
        this.map = new L.map(domid, option);
        // Canvas 画板部分
        let canvasLayer = L.GridLayer.extend({
            createTile: function (coords) {
                // create a <canvas> element for drawing
                var tile = L.DomUtil.create('canvas', 'leaflet-tile');
                // setup tile width and height according to the options
                var size = this.getTileSize();
                tile.width = size.x;
                tile.height = size.y;
                // get a canvas context and draw something on it using coords.x, coords.y and coords.z
                var ctx = tile.getContext('2d');
                ctx.clearRect(0, 0, tile.width, tile.height);
                //设置绘制颜色
                ctx.fillStyle = "#0000FF";
                //绘制成矩形
                ctx.fillRect(2, 2, 4, 4);
                // return the tile so it can be rendered on screen
                return tile;
            }
        });

        this.map.addControl(L.control.zoom({ position: "topright" }));
        this.map.addLayer(this.mapLayer);
        // this.map.addLayer(canvasLayer);
        this.map.setView(center, zoom);
    }
    _getLayer(type) {
        let mapLayer = null;
        switch (type) {
            case 'BMap':
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
                break;
            default:
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
        return mapLayer;
    }
    _getCRS(type) {
        let crs = null;
        switch (type) {
            case 'BMap':
                crs = new L.Proj.CRS(
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
                break;
            default:
                break;
        }
        return crs;
    }
    /**
     * 修改地图缩放等级
     * @param {Number} zoom 
     */
    setZoom(zoom) {
        if (typeof zoom === 'string') {
            zoom = parseInt(zoom);
        }
        this.map.setZoom(zoom);
    }
    /**
     * 移动地图到坐标
     * @param {array} point [lng,lat]
     */
    flyTo(point) {
        if (typeof point === 'array') {
            this.map.flyTo(point);
        }
    }
    /**
     * 移动地图到视野
     * @param {array} pointNW [lng,lat]
     * @param {array} pointSE [lng,lat]
     */
    flyToBounds(pointNW, pointSE) {
        if (typeof pointNW === 'array' && typeof pointSE === 'array') {
            this.map.flyToBounds([pointNW, pointSE]);
        }
    }
    /**
     * 切换地图
     * @param {String} type? BMap/GMap/AMap
     */
    _changeMap(type) {
        let crs = this._getCRS(type);
        let mapLayer = this._getLayer(type);
        this.map.removeLayer(this.mapLayer);
        this.map.addLayer(mapLayer);
        this.mapLayer = mapLayer;
    }
}