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
import offline from "../assets/0.png";
import online from "../assets/1.png";
import alarm from "../assets/2.png";
import m0 from "../assets/m0.png";
import m1 from "../assets/m1.png";
import m2 from "../assets/m2.png";
import m3 from "../assets/m3.png";
import m4 from "../assets/m4.png";

export class MarkerList {
    constructor(map, canvas, cb) {
        this.map = map;
        this.canvas = canvas;
        this.clickCB = cb;
        this.list = [];  //数据列表
        this.imgList = []; //车辆图像列表
        this.boundsList = []; //车辆区域列表
        this.drawList = []; //绘制列表
        this.popup = null;
        this.popupId = -1;
        this.ctx = canvas.getContext('2d');
        let that = this;
        this.drawEvent = function (e) {
            that._reDraw();
        };
        this.map.on('zoomend', this.drawEvent);
        this.map.on('resize', this.drawEvent);
        this.map.on('moveend', this.drawEvent);
        this._addClickEvent();
        this._init();
        this._cache();
    }
    /**
     * 增加 markerList
     * @param {Array} listArray 
     */
    push(listArray) {
        this.list = listArray;
        this._reDraw();
    }
    /**
     * 清理 markerList
     */
    remove() {
        this.list.length = 0;
        this._clear();
    }
    /**
     * 设定气泡内容
     * @param {*} htmlStr 
     */
    setPopupContent(htmlStr) {
        if (this.popup !== null) {
            this.popup.setContent(htmlStr);
        }
    }
    /**
     * 初始化画布
     */
    _init() {
        let getPixelRatio = function (context) {
            let backingStore = context.backingStorePixelRatio ||
                context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio || 1;
            return (window.devicePixelRatio || 1) / backingStore;
        };
        //画文字
        let ratio = getPixelRatio(this.ctx);

        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';

        this.canvas.width = this.canvas.width * ratio;
        this.canvas.height = this.canvas.height * ratio;

        // 放大倍数
        this.ctx.scale(ratio, ratio);
    }
    /**
     * 缓存图片
     */
    _cache() {
        let img0 = new Image(24, 24);
        img0.src = offline;
        this.imgList.push(img0);
        let img1 = new Image(24, 24);
        img1.src = online;
        this.imgList.push(img1);
        let img2 = new Image(24, 24);
        img2.src = alarm;
        this.imgList.push(img2);
    }
    /**
     * 改变气泡位置
     * @param {*} element 
     */
    _setPopupLatLng(element) {
        if (element.id === this.popupId) {
            if (this.popup !== null) {
                this.popup.setLatLng([element.lat, element.lng]);
                if (this.clickCB) {
                    this.clickCB(element.id);
                }
            }
        }
    }
    /**
     * 增加点击事件监听
     */
    _addClickEvent() {
        let that = this;
        this.canvas.addEventListener('click', function (e) {
            let x = e.layerX;
            let y = e.layerY;
            let point = [x, y];
            that.boundsList.forEach(element => {
                if (element.bounds.contains(point)) {
                    let latlng = that.map.containerPointToLatLng(point);
                    if (that.popup !== null) {
                        that.popup.remove();
                    }
                    that.popup = L.popup()
                        .setLatLng(latlng)
                        .setContent('...加载中...')
                        .openOn(that.map);
                    that.popupId = element.ele.id;
                    if (that.clickCB) {
                        that.clickCB(element.ele.id);
                    }
                }
            });
        });
    }
    /**
     * 清理
     */
    _clear() {
        let size = this.map.getSize();
        this.ctx.clearRect(0, 0, size.x, size.y);
        this.boundsList.length = 0;
    }
    /**
     * 重绘
     */
    _reDraw() {
        let that = this;
        this._clear();
        if (this.list && this.list.length > 0) {
            console.time('time');
            this._cluster();
            this._draw();
            console.timeEnd('time');
        }
    }
    /**
     * 计算集群
     */
    _cluster() {
        const basicSize = 34;
        const maxZoom = 20;
        const zoom = this.map.getZoom();
        const size = this.map.getSize();
        const viewBounds = L.bounds([0, 0], [size.x, size.y]);
        const boxSize = Math.floor((maxZoom - zoom) / 2) * basicSize;
        const xCount = Math.ceil(size.x / boxSize);
        const yCount = Math.ceil(size.y / boxSize);
        const boxList = [];
        for (let i = 0; i < xCount; i++) {
            for (let j = 0; j < yCount; j++) {
                const start = [i * boxSize, j * boxSize];
                const end = [(i + 1) * boxSize, (j + 1) * boxSize];
                const bounds = L.bounds(start, end);
                boxList.push({
                    bounds,
                    list: [],
                    one: null,
                });
            }
        }
        this.list.forEach(element => {
            let point = this.map.latLngToLayerPoint([element.lat, element.lng]);
            point = this.map.layerPointToContainerPoint(point); //地理坐标点转换到容器像素点
            if (viewBounds.contains(point)) { //视界内的点进行绘制
                boxList.forEach(item => {
                    if (item.bounds.contains(point)) { //点在box内
                        item.list.push(point);
                        item.one = element;
                    }
                });
            }
        });
        this.drawList.length = 0;
        boxList.forEach(item => {
            const size = item.list.length;
            const center = this._getPolygonAreaCenter(item.list);
            this.drawList.push({
                size,
                center,
                one: item.one,
            });
        });
    }
    /**
     * 获取多边形质心
     * @param {*} points 
     */
    _getPolygonAreaCenter(points) {
        if (points.length === 1) {
            return points[0];
        } else if (points.length === 2) {
            return [(points[0].x + points[1].x) / 2, (points[0].y + points[1].y) / 2];
        } else {
            //以下为网上down的一个多边形质心算法
            function Point(x, y) {
                this.x = x;
                this.y = y;
            }
            function Region(points) {
                this.points = points || [];
                this.length = points.length;
            }
            Region.prototype.area = function () {
                var area = 0,
                    i,
                    j,
                    point1,
                    point2;
                for (i = 0, j = this.length - 1; i < this.length; j = i, i++) {
                    point1 = this.points[i];
                    point2 = this.points[j];
                    area += point1.x * point2.y;
                    area -= point1.y * point2.x;
                }
                area /= 2;
                return area;
            };
            Region.prototype.centroid = function () {
                var x = 0,
                    y = 0,
                    i,
                    j,
                    f,
                    point1,
                    point2;
                for (i = 0, j = this.length - 1; i < this.length; j = i, i++) {
                    point1 = this.points[i];
                    point2 = this.points[j];
                    f = point1.x * point2.y - point2.x * point1.y;
                    x += (point1.x + point2.x) * f;
                    y += (point1.y + point2.y) * f;
                }
                f = this.area() * 6;
                return new Point(x / f, y / f);
            };
            const region = new Region(points);
            return region.centroid();
        }
    }
    /**
     * 绘制
     */
    _draw() {
        this.drawList.forEach(item => {
            if (item.size === 0) {

            } else if (item.size === 1) {//常规绘制
                let direction = parseInt(item.one.direction ? item.one.direction : 0); // 方向
                let img = this.imgList[item.one.state];
                let point = item.center;
                //绘制图标
                if (direction <= 0 || direction >= 360) {
                    this.ctx.drawImage(img, point.x - img.width / 2, point.y - img.height / 2);
                } else {
                    let angle = 0;
                    if (direction > 0 && direction <= 180) {
                        angle = Math.PI * direction / 180;
                    } else {
                        angle = Math.PI * (direction / 180 - 2);
                    }
                    this.ctx.rotate(angle);
                    this.ctx.drawImage(img, point.x - img.width / 2, point.y - img.height / 2);
                    this.ctx.rotate(-angle);
                }
                //绘制文字
                let width = item.one.text.length * 5;
                let height = 10;
                let x = point.x - width / 2;
                let y = point.y - img.height / 2 - height - 2;
                //框部分
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(x, y, width, height);
                //字体部分
                this.ctx.font = "7px";
                this.ctx.strokeStyle = '#000000';
                this.ctx.strokeText(item.one.text, x, y + height, width);
                //范围列表
                let bounds = L.bounds([[x, y], [point.x + img.width / 2, point.y + img.height / 2]]);
                this.boundsList.push({
                    ele: item.one,
                    bounds: bounds,
                });
                //气泡
                this._setPopupLatLng(item.one);
            } else {//集群绘制
                const img = new Image();
                const point = item.center;
                const that = this;
                img.onload = function () {
                    const textWidth = 25;
                    that.ctx.drawImage(img, point.x - img.width / 2, point.y - img.height / 2);
                    that.ctx.font = "7px";
                    that.ctx.strokeStyle = '#000000';
                    that.ctx.strokeText(item.size, point.x - textWidth / 2, point.y + 4, textWidth);
                };
                if (item.size <= 1000) {
                    img.src = m0;
                } else if (item.size <= 2000) {
                    img.src = m1;
                } else if (item.size <= 4000) {
                    img.src = m2;
                } else if (item.size <= 8000) {
                    img.src = m3;
                } else {
                    img.src = m4;
                }
            }
        });
    }
}