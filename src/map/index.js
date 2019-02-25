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

        this.map.addControl(L.control.zoom({ position: "topright" }));
        this.map.addLayer(this.mapLayer);
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
            case "GMap":
                mapLayer = new L.tileLayer('http://mt{s}.google.cn/vt/lyrs=m@160000000&hl=zh-CN&gl=CN&src=app&y={y}&x={x}&z={z}&s=Ga',
                    {
                        subdomains: [0, 1, 2, 3],
                        attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    }
                );
                break;
            case "SSMap":
                mapLayer = new L.tileLayer('http://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style=0',
                    {
                        tms: true,
                        subdomains: [0, 1, 2, 3],
                        attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    }
                );
                break;
            case "AMap":
                mapLayer = new L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
                    {
                        subdomains: [1, 2, 3, 4],
                        attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
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
                    //"EPSG:3395",
                    //"+proj=merc +lon_0=0 +k=1 +x_0=140 +y_0=-250 +datum=WGS84 +units=m +no_defs",
                    'EPSG:900913',
                    '+proj=merc +a=6378206 +b=6356584.314245179 +lat_ts=0.0 +lon_0=0.0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
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
        if (typeof point === 'object') {
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
    /**
     * 创建自定义Canvas面板
     */
    createCanvasPane() {
        let canvas = L.DomUtil.create('canvas');
        let pane = this.map.createPane('customCanvas');
        let size = this.map.getSize();
        let that = this;

        this.customCanvasPaneResizeEvent = function (e) {
            size = that.map.getSize();
            canvas.width = size.x;
            canvas.height = size.y;
        };
        this.customCanvasPaneMoveendEvent = function (e) {
            let topLeft = that.map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(canvas, topLeft);
        };
        this.map.on('resize', this.customCanvasPaneResizeEvent);
        this.map.on('moveend', this.customCanvasPaneMoveendEvent);

        canvas.width = size.x;
        canvas.height = size.y;
        pane.style['z-index'] = 300;
        pane.appendChild(canvas);
        return canvas;
    }
    /**
     * 移除自定义Canvas面板
     */
    removeCanvasPane() {
        let pane = this.map.getPane('customCanvas');
        pane.parentNode.removeChild(pane);
        this.map.off('resize', this.customCanvasPaneResizeEvent);
        this.map.off('moveend', this.customCanvasPaneMoveendEvent);
    }
}