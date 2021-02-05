import darkCanvasBg from "./imgs/canvas_bg_dark.png";
import lightCanvasBg from "./imgs/canvas_bg_light.png";
export const themeMap = {
    dark: {
        bgImg: darkCanvasBg,
        navigatorLineColor: "#05ddff",
        rulerLineColor: "rgba(0, 173, 255, 0.84)",
        rulerBgColor: "#0E1013",
        rulerFontColor: "#90a0ae",
        rulerTickColor: "#3A4659",
        bottomBarBgColor: "#222528",
        bottomBarBorderTopColor: "#000",
        maskBgColor: 'rgba(0, 231, 255, 0.07)'
    },
    light: {
        bgImg: lightCanvasBg,
        navigatorLineColor: "#000",
        rulerLineColor: "#000",
        rulerBgColor: "#F2F2F2",
        rulerFontColor: "#000",
        rulerTickColor: "#000",
        bottomBarBgColor: "#F3F3F3",
        bottomBarBorderTopColor: "#A2A2A2",
        maskBgColor: 'rgba(255, 255, 255, 0.07)'
    }
}