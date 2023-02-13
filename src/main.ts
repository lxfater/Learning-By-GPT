import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Sidebar, SidebarItem,Field, CellGroup,Button,Switch, Cell, Notify,Col,Row, Picker, Divider, Popup, Form  } from 'vant';
import 'vant/lib/index.css';
import router  from './routes';
import '@vant/touch-emulator'

const app = createApp(App);

app.use(Field)
.use(Form)
.use(CellGroup)
.use(Sidebar)
.use(SidebarItem)
.use(Button)
.use(Switch)
.use(Cell)
.use(Notify)
.use(Col)
.use(Row)
.use(Divider)
.use(Picker)
.use(Popup)
.use(router)
app.mount('#app')

