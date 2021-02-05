// 获取元素位置（相对viewport)
// the number of pixels from the top of the closest relatively positioned parent element.
export function getPosition(element) {
    var left = element.offsetLeft;
    var top = element.offsetTop;
    var current = element.offsetParent;
    while (current !== null) {
        left += current.offsetLeft;
        top += current.offsetTop;
        current = current.offsetParent;
    }
    return [left, top];
}