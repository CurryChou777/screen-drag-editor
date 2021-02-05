import { get, cloneDeep, filter, pullAt, merge, map, sortBy, findIndex } from 'lodash-es'
import { generateCardId, defaultCardStyle } from '../../../src/utils/gen-card'
import { traverseTree, getGroupView, setVal, chainKeyPath } from '../../../src/utils'
import { MessageBox } from 'element-ui'
import { themeMap } from './const'

export default {
  state: {
    theme: 'light',
    screenOffset: 60,
    screen: {
      page: {
        background: {
          color: "rgba(14, 42, 67, 1)",
          imgUrl: ""
        },
        size: { w: 1920, h: 1080 }
      },
      cards: []
    },
    attachMenus: [],
    pathToView: '',
    scale: 0.6,
    hoveredIdx: -1,
    guideLines: { h: [], v: [] },
    guideLinesVisible: true,
    // selectionRect: [],
    selectedIdxs: [],
    cardsToBePaste: [],
    componentMap: {},
  },
  mutations: {
    'attachMenus.set'(state, val) {
      state.attachMenus = val
    },
    'pathToView.set'(state, val) {
      state.pathToView = val
    },
    'theme.set'(state, val) {
      state.theme = val
    },
    'cards.hover'(state, idx) {
      state.hoveredIdx = idx;
    },
    'screenOffset.set'(state, val) {
      state.screenOffset = val
    },
    'screen.set'(state, val) {
      state.screen = val
    },
    'cards.select'(state, idxs) {
      state.selectedIdxs = idxs;
    },
    'scale.set'(state, val) {
      state.scale = val
    },
    'componentMap.set'(state, val) {
      state.componentMap = val
    },
    'screen.update'(state, payload) {
      for (let k in payload) {
        setVal(state.screen, k, payload[k]);
      }
    },
    'guideLines.toggle'(state) {
      state.guideLinesVisible = !state.guideLinesVisible;
    },
    'guideLines.set'(state, lines) {
      state.guideLines = lines;
      // storage.setObject(GUIDELINES_KEY, { lines, screenId: state.screenId });
    },
    'cards.copy'(state) {
      state.cardsToBePaste = [...state.selectedIdxs];
    },
  },
  getters: {
    zMax: ({ screen, pathToView }) => {
      return Math.max(...screen.cards.map(card => get(card, pathToView).z), 100);
    },
    zMin: ({ screen, pathToView }) => {
      return Math.min(...screen.cards.map(card => get(card, pathToView).z), 100);
    },
    cardsInSelection() {
      return []
      // if (!state.selectionRect.length) {
      //     return [];
      // }
      // let idxArr = [];
      // state.screen.cards.map((card, i) => {
      //     const { x, y, w, h } = card.cardStyle.view;
      //     const cardRect = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      //     hasOverlap(state.selectionRect, cardRect) && idxArr.push(i);
      // });
      // return idxArr;
    },
    themeConfig({ theme }) {
      return themeMap[theme];
    },
  },
  actions: {
    'cards.paste'({ state, getters, commit, dispatch }, pasteAt) {
      if (!state.cardsToBePaste.length) {
        return;
      }
      const cards = state.screen.cards;

      // 如果有指定pasteAt offset要计算得出
      let offset = [30, 30];
      // offset计算方法 目标中心点 - 目前中心点
      if (pasteAt) {
        const { x, y } = pasteAt;
        const view = getGroupView(state.cardsToBePaste.map((a, i) => get(cards[i], state.pathToView)));
        const oldCenter = [view.x + view.w / 2, view.y + view.h / 2];
        offset = [parseInt(x - oldCenter[0]), parseInt(y - oldCenter[1])];
      }

      const copies = state.cardsToBePaste.map(idx => {
        const card = cards[idx];
        const copy = cloneDeep(card);
        const view = get(copy, state.pathToView);
        const { x, y } = view
        copy.id = generateCardId(card.type);
        view.x = x + offset[0];
        view.y = y + offset[1];
        view.z = getters.zMax + idx + 1;
        return copy;
      });
      dispatch('screen.update', {
        // todo 传输数据量会不会太大
        cards: cards.concat(copies),
      });
      commit('cards.select', copies.map((a, i) => i + cards.length));
    },
    'cards.group'({ state, commit, dispatch }, groupType) {
      const nameMap = {
        normal: '组',
        tabs: '组（页签体）',
        slider: '组（轮播）',
      };
      const cards = state.screen.cards;
      const groupCards = state.selectedIdxs.map(i => ({
        ...cards[i],
        index: i,
      }));
      const view = getGroupView(groupCards, groupType);
      const type = 'group';
      const groupCard = {
        id: generateCardId(type),
        type,
        name: nameMap[groupType],
        cardStyle: {
          ...defaultCardStyle,
          view,
        },
        noData: true,
        isGroup: true,
        option: {
          groupType,
          slider: {
            align: {
              v: 'middle',
              h: 'center',
            },
            indicator: {
              show: false,
            },
          },
          tabs: {
            var: '',
          },
        },
        children: groupCards.map(card => {
          const { x: oldX, y: oldY } = card.cardStyle.view;
          return merge({}, card, {
            cardStyle: {
              view: { x: oldX - view.x, y: oldY - view.y },
            },
          });
        }),
      };
      pullAt(cards, state.selectedIdxs);
      dispatch('screen.update', { cards: cards.concat(groupCard) });
      commit('cards.select', []);
    },
    'cards.delete'({ state, commit, dispatch }) {
      MessageBox.confirm(
        `确认删除选中的${state.selectedIdxs.length}个组件吗？`,
        '删除组件'
      ).then(() => {
        // 根据索引 对树节点进行过滤删除
        let cards = state.screen.cards;
        let childComIds = [];
        cards = filter(cards, (card, i) => !state.selectedIdxs.includes(i));

        traverseTree(cards, (card, level, keyPath) => {
          if (card.children) {
            card.children = filter(
              card.children,
              (card, i) =>
                !state.selectedIdxs.includes(`${keyPath}.children.${i}`)
            );
          }
        });
        cards = filter(cards, card => !childComIds.includes(card.id));
        dispatch('screen.update', { cards });
        commit('cards.select', []);
      });
    },
    'cards.copy'({ commit }) {
      commit('cards.copy');
    },
    'cards.hide'({ state, dispatch }) {
      state.selectedIdxs.forEach(idx => {
        dispatch('screen.update', { [`cards.${idx}.hide`]: true });
      });
    },

    'cards.lock'({ state, dispatch }) {
      state.selectedIdxs.forEach(idx => {
        dispatch('screen.update', { [`cards.${idx}.locked`]: true });
      });
    },
    'cards.unlock'({ state, dispatch }) {
      state.selectedIdxs.forEach(idx => {
        dispatch('screen.update', { [`cards.${idx}.locked`]: false });
      });
    },
    'cards.add'({ state, dispatch }, moreCards) {
      const len = state.screen.cards.length;
      const payload = moreCards.reduce((acc, cur, i) => {
        acc[`cards.${len + i}`] = cur;
        return acc;
      }, {});
      dispatch('screen.update', payload);
    },
    // todo: maybe removed? (as same mutation exists)
    'screen.update'({ commit }, change) {
      commit('screen.update', change);
    },
    // 从组件外部通过调用updateScreen或updateCurCard更新
    'screen.updateExternally'({ commit }, change) {
      commit('screen.update', change);
    },
    // 连续移动 (支持选中多个一起移动)
    'cards.drag'({ state, dispatch }, { rect, index }) {
      // todo 性能问题
      const { left, top } = rect;
      const { x: oldLeft, y: oldTop } = get(
        state,
        chainKeyPath(`screen.cards.${index}`, state.pathToView)
      );
      const deltaX = left - oldLeft;
      const deltaY = top - oldTop;
      state.selectedIdxs.forEach(idx => {
        const pathToView = chainKeyPath(`cards.${idx}`, state.pathToView)
        const { x, y } = get(state.screen, pathToView);
        dispatch('screen.update', {
          [`${pathToView}.x`]: x + deltaX,
          [`${pathToView}.y`]: y + deltaY,
        });
      });
    },
    'layer.move'({ state, dispatch }, dest) {
      // 交换z
      const cards = state.screen.cards;

      const inGroup = typeof state.selectedIdxs[0] === 'string';
      if (inGroup) {
        const pathSegments = state.selectedIdxs[0].split('.');
        const movingCardIndex = pathSegments.pop();
        updateZIndex(get(cards, pathSegments.join('.')), movingCardIndex, dest);
      } else {
        updateZIndex(cards, state.selectedIdxs[0], dest);
      }
      function updateZIndex(siblingCards, movingCardIndex, dest) {
        const card = siblingCards[movingCardIndex];
        // let zMine = card.cardStyle.view.z;
        let zMine = get(card, `${state.pathToView}.z`)

        const zMax = Math.max(...map(siblingCards, `${state.pathToView}.z`));
        const zMin = Math.min(...map(siblingCards, `${state.pathToView}.z`));
        if (
          (zMine === zMax && ['TOP', 'UP'].includes(dest)) ||
          (zMine === zMin && ['BOTTOM', 'DOWN'].includes(dest))
        ) {
          return;
        }

        if (dest === 'TOP') {
          dispatch('screen.update', { [`cards.${state.selectedIdxs[0]}.${state.pathToView}.z`]: zMax + 1 });
        } else if (dest === 'BOTTOM') {
          // TODO 最后可能一直减到100以下
          dispatch('screen.update', { [`cards.${state.selectedIdxs[0]}.${state.pathToView}.z`]: zMin - 1 });
        } else {
          const layers = sortBy(
            siblingCards.map((card, index) => ({ ...card, index })),
            card => get(card, `${state.pathToView}.z`)
          ).reverse();

          let myLayerIdx = findIndex(layers, { index: +movingCardIndex });
          let yourLayerIdx = dest === 'DOWN' ? myLayerIdx + 1 : myLayerIdx - 1;
          const you = layers[yourLayerIdx];
          const zYours = get(you, `${state.pathToView}.z`);
          const yourCardIdx = inGroup
            ? `${state.selectedIdxs[0]
              .split('.')
              .slice(0, -1)
              .join('.')}.${you.index}`
            : you.index;
          dispatch('screen.update', { [`cards.${state.selectedIdxs[0]}.${state.pathToView}.z`]: zYours });
          dispatch('screen.update', {
            ['cards.' + yourCardIdx + `.${state.pathToView}.z`]: zMine,
          });
        }
      }
    },

  }

}