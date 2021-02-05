export * from 'lodash-es';
import { minBy, maxBy, get as _get } from 'lodash-es'
import Vue from 'vue'
// chainKeyPath('a.c.f', 'd') => a.c.f.d
// chainKeyPath('a.c.f', '../d') => a.c.d
export function chainKeyPath(keyPath, field) {
    if (!field) {
        return keyPath;
    }
    return keyPath + '.' + field
    // return field
    //     .split('/')
    //     .reduce((result, part) => {
    //         if (part === '..') {
    //             return result.slice(0, -1);
    //         } else if (part === '.') {
    //             return result;
    //         } else {
    //             return [...result, part];
    //         }
    //     }, keyPath.split('.'))
    //     .join('.');
}
// 遍历树 https://objcer.com/2017/02/26/traverse-the-tree/
export function traverseTree(
    root,
    action,
    childrenAlias = 'children',
    level = 0,
    curKeyPath = ''
) {
    if (!root) return;
    // return false时  停止遍历
    if (action(root, level, curKeyPath) === false) return;
    if (level === 0 && Array.isArray(root)) {
        root.forEach((item, i) => {
            traverseTree(
                item,
                action,
                childrenAlias,
                level + 1,
                curKeyPath ? curKeyPath + '.' + i : i
            );
        });
    } else {
        root[childrenAlias] &&
            root[childrenAlias].forEach((item, i) => {
                traverseTree(
                    item,
                    action,
                    childrenAlias,
                    level + 1,
                    `${curKeyPath}.${childrenAlias}.${i}`
                );
            });
    }
}

// 计算多个卡片组合后的view
export function getGroupView(viewArr, groupType = 'normal') {
    // const viewArr = map(groupCards, 'cardStyle.view');
    const x = minBy(viewArr, 'x').x;
    const y = minBy(viewArr, 'y').y;
    const z = maxBy(viewArr, 'z').z;
    let w, h;
    if (groupType === 'normal') {
        const { x: x1, w: w1 } = maxBy(viewArr, ({ x, w }) => x + w);
        const { y: y1, h: h1 } = maxBy(viewArr, ({ y, h }) => y + h);
        w = x1 + w1 - x;
        h = y1 + h1 - y;
    } else {
        w = maxBy(viewArr, 'w').w;
        h = maxBy(viewArr, 'h').h;
    }

    return { x, y, z, w, h };
}

// 角度 -> 点坐标
export function angle2Coord(deg) {
    const cos = Math.cos((Math.PI / 180) * deg);
    const sin = Math.sin((Math.PI / 180) * deg);
    switch (true) {
        case deg >= 0 && deg < 90:
            return [0, 0, cos, sin];
        case deg >= 90 && deg < 180:
            return [-cos, 0, 0, sin];
        case deg >= 180 && deg < 270:
            return [-cos, -sin, 0, 0];
        default:
            return [0, -sin, cos, 0];
    }
}


// 把\\ 转换成 \
export function unescapeSpecialChar(str) {
    return (
        (str || '')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            // .replace(/\\\\/g, '\\')
            .replace(/\\f/g, '\f')
    );
}

export function escapeSpecialChar(str) {
    return (
        (str || '')
            // .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .replace(/\f/g, '\\f')
    );
}


export function setVal(obj, key, val) {
    let fields = key.split('.');
    const k = fields.pop();
    for (let field of fields) {
        if (!(field in obj)) {
            // todo 发送错误日志
            // 同时兼容
            Vue.set(obj, field, {});
        }
        obj = obj[field];
    }
    Vue.set(obj, k, val);
}


export function get(obj, path) {
    if (path) {
        return _get(obj, path)
    } else {
        return obj
    }
}

export function kebabToCamel(s) {
    return s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
}
