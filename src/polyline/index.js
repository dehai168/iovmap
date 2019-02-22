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
export class Polyline {
    constructor(map, eleArray) {
        this.map = map;
        this.polylines = [];
        let that = this;
        let latlngArray = [];
        let draw = function () {
            if (latlngArray.length > 0) {
                const polyline = L.polyline(latlngArray, { color: color, weight: 5 });
                polyline.addTo(that.map);
                that.polylines.push(polyline);
            }
        };
        if (eleArray.length < 2) return;
        let first = eleArray[0];
        let color = that._getColor(first.speed);
        latlngArray.push([first.lat, first.lng]);
        for (let index = 1; index < eleArray.length; index++) {
            const ele = eleArray[index];
            const tempColor = that._getColor(ele.speed);
            latlngArray.push([ele.lat, ele.lng]);
            if (color !== tempColor) {
                latlngArray.push([ele.lat, ele.lng]);
                draw();
                latlngArray.length = 0;
                color = tempColor;
                index = index - 1;
            }
        }
        draw();
    }
    /**
     * 移除
     */
    remove() {
        this.polylines.forEach(element => {
            element.remove();
        });
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
}