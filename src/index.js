import ConfigView from '../packages/config-view'
import ScreenEditor from '../packages/screen-editor'
export { ConfigView, ScreenEditor }

const install = Vue => {
    Vue.component('config-view', ConfigView)
    Vue.component('screen-editor', ScreenEditor)
}

export default { install }