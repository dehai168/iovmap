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

export class MarkerList {
    constructor(map, canvas, cb) {
        this.map = map;
        this.canvas = canvas;
        this.clickCB = cb;
        this.imgList = [];
        this.boundsList = [];
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
            this._draw();
            console.timeEnd('time');
        }
    }
    /**
     * 绘制
     */
    _draw() {
        let that = this;
        let size = this.map.getSize();
        let viewBounds = L.bounds([0, 0], [size.x, size.y]);
        this.list.forEach(element => {
            let direction = parseInt(element.direction ? element.direction : 0); // 方向
            let img = that.imgList[element.state];
            let point = that.map.latLngToLayerPoint([element.lat, element.lng]);
            point = that.map.layerPointToContainerPoint(point); //地理坐标点转换到容器像素点
            if (viewBounds.contains(point)) { //视界内的点进行绘制
                //绘制图标
                if (direction <= 0 || direction >= 360) {
                    that.ctx.drawImage(img, point.x - img.width / 2, point.y - img.height / 2);
                } else {
                    let angle = 0;
                    if (direction > 0 && direction <= 180) {
                        angle = Math.PI * direction / 180;
                    } else {
                        angle = Math.PI * (direction / 180 - 2);
                    }
                    that.ctx.rotate(angle);
                    that.ctx.drawImage(img, point.x - img.width / 2, point.y - img.height / 2);
                    that.ctx.rotate(-angle);
                }
                //绘制文字
                let width = element.text.length * 5;
                let height = 10;
                let x = point.x - width / 2;
                let y = point.y - img.height / 2 - height - 2;
                //框部分
                that.ctx.fillStyle = '#FFFFFF';
                that.ctx.fillRect(x, y, width, height);
                //字体部分
                that.ctx.font = "7px";
                that.ctx.strokeStyle = '#000000';
                that.ctx.strokeText(element.text, x, y + height, width);
                //范围列表
                let bounds = L.bounds([[x, y], [point.x + img.width / 2, point.y + img.height / 2]]);
                that.boundsList.push({
                    ele: element,
                    bounds: bounds,
                });
                //气泡
                that._setPopupLatLng(element);
            }
        });
    }
}