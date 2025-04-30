import './App.css'
import { AppSidebar } from './components/app-sidebar';
import { SiteHeader } from "./components/site-header";
import { SidebarInset, SidebarProvider } from './components/ui/sidebar';

function App() {
  
  return (
    
    <SidebarProvider>
      <AppSidebar variant="sidebar" />
      <SidebarInset>
            {/* <SiteHeader /> */}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
