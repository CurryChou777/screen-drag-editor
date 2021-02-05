import CollapseBar from './components/collapse-bar.vue';
import { chainKeyPath, isFunction, get, mapKeys, setVal } from '../../../src/utils';
import DynamicSetter from './dynamic-setter';
const renderMap = {};

const render = (h, configs, option, onUpdate) => {
  const setter = function (key, value) {
    if (arguments.length === 1) {
      for (let k in arguments[0]) {
        let val = arguments[0][k]
        setVal(option, k, val)
        onUpdate({ [k]: val })
      }
    } else {
      setVal(option, key, value)
      onUpdate({ [key]: value })
    }
  }
  const rw = function (keyPath) {
    const firstArgType = typeof arguments[0]
    if (arguments.length === 1) {
      if (firstArgType === 'string') {
        return get(option, keyPath)
      } else if (firstArgType === 'object') {
        setter(...arguments)
      }

    } else {
      if (firstArgType === 'string') {
        setter(...arguments)
      } else if (firstArgType === 'object') {
        // eg: rptVal({'a.b': val, 'b.c': val}, 'base')
        // same result as rptVal({'base.a.b': val, 'base.b.c': val}, 'base')
        const [obj, pathPrefix] = arguments;
        const payload = mapKeys(obj, (val, key) => pathPrefix + '.' + key);
        setter(payload)
      }

    }
  }
  rw.withBaseKeyPath = function (baseKeyPath) {
    return function () {
      const firstArgType = typeof arguments[0]
      if (arguments.length === 1) {
        if (firstArgType === 'string') {
          return rw(chainKeyPath(baseKeyPath, arguments[0]));
        } else if (firstArgType === 'object') {
          rw(arguments[0], baseKeyPath)
        }
      } else {
        if (firstArgType === 'string') {
          rw(chainKeyPath(baseKeyPath, arguments[0]), arguments[1]);
        } else if (firstArgType === 'object') {
          rw(arguments[0], chainKeyPath(baseKeyPath, arguments[1]));
        }
      }
    };

  }
  const renderConfig = (item, curKeyPath) => {
    const { field } = item
    const keyPath = curKeyPath ? chainKeyPath(curKeyPath, field) : field;
    if (item.configs && item.type !== 'group') {
      // 有子配置项
      const { name, hasShowSwitcher, aliasOfShow = 'show' } = item;

      const show =
        'show' in item
          ? isFunction(item.show)
            ? item.show(rw.withBaseKeyPath(curKeyPath))
            : item.show
          : true;
      return (
        <CollapseBar
          v-show={show}
          class="line"
          collapse={!item.expand}
          hasShowSwitcher={'hasShowSwitcher' in item ? hasShowSwitcher : false}
          onToggleShow={val => rw(keyPath + '.' + aliasOfShow, val)}
          show={rw(keyPath + '.' + aliasOfShow)}
        >
          <span slot="title">
            <span>{name}</span>
            {item.tip ? (
              <icon name="help" class="icon-help-info" v-tooltip={item.tip} />
            ) : null}
          </span>
          {item.configs.map(config => {
            return renderConfig(config, keyPath);
          })}
        </CollapseBar>
      );
    } else if (item.type === 'object' || item.type === 'array') {
      // 类型为object 或 array
      return (
        <DynamicSetter
          configItem={item}
          keyPath={keyPath}
          type={item.type}
          value={rw(keyPath)}
        />
      );
    } else {
      // normal case
      const { type } = item;


      if (!renderMap[type] && !['custom', 'group'].includes(type)) {
        console.log(`不支持类型：${type}，keyPath：${keyPath}`);
        return;

      }

      // make sure props exists in config
      const config = { ...item, keyPath, props: item.props || {} };

      const groupRender = (h, config, rw) => {
        return (
          <div class="flex-row group">
            {config.configs.map(childConfig =>
              renderMap[childConfig.type](
                h,
                {
                  ...childConfig,
                  keyPath: keyPath + '.' + childConfig.field,
                },
                rw
              )
            )}
          </div>
        );
      };

      const itemRender =
        type === 'custom'
          ? item.render
          : type === 'group'
            ? groupRender
            : renderMap[type];

      const content = itemRender(h, config, rw);
      const show =
        'show' in item
          ? typeof item.show === 'function'
            ? item.show(rw.withBaseKeyPath(curKeyPath))
            : item.show
          : true;

      return show ? (
        <div class={'flex-row line' + (type === 'code' ? ' code' : '')}>
          {config.name ? (
            <label>
              {config.name}
              {item.tip ? (
                <icon name="help" class="icon-help-info" v-tooltip={item.tip} />
              ) : null}
            </label>
          ) : null}
          {content}
        </div>
      ) : null;
    }
  };

  return (
    <div class="configs-wp">
      {configs.map(config => {
        return renderConfig(config);
      })}
    </div>
  );
};

render.addType = (type, component) => {
  renderMap[type] = function (h, config, rw) {
    return h(component, {
      attrs: {
        ...config.props,
        value: rw(config.keyPath),
      },
      // props: {
      //   ...config.props,
      //   value: rw(config.keyPath),
      // },
      on: {
        input: val => rw(config.keyPath, val),
      },
    });
  };
};

render.setTypeMap = typeMap => {
  Object.entries(typeMap).forEach(([key, value]) => render.addType(key, value));
};

export default render;
