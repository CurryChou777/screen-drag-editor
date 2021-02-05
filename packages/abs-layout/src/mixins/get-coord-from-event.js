import { getPosition } from "../../../../src/helpers";

export default {
    methods: {
        getCoordFromEvent(e) {
            // 获取点击点 距离 画布的距离
            // 点击处 距离页面的距离
            // 画布距离页面的距离 之差
            // todo dead code here
            const el = document.querySelector("#screen");
            const panel = document.querySelector(".canvas-wp");
            const [left, top] = getPosition(el);
            const x = (e.pageX - left + panel.scrollLeft) / this.scale;
            const y = (e.pageY - top + panel.scrollTop) / this.scale;
            return { x, y };
        },
    },
}