import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { IonApp, IonSplitPane, setupIonicReact } from '@ionic/react';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Dark Mode (Class based) */
import '@ionic/react/css/palettes/dark.class.css';

/* Theme variables */
import './theme/variables.css';
import './index.css';

import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { AxiosLoadingInterceptor } from './components/AxiosLoadingInterceptor';
import Menu from './components/Menu';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/dashboard/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import CustomerView from './pages/customers/CustomerView';
import CustomerForm from './pages/customers/CustomerForm';
import ItemList      from './pages/items/ItemList';
import ItemView      from './pages/items/ItemView';
import ItemForm      from './pages/items/ItemForm';
import CategoryList  from './pages/categories/CategoryList';
import CategoryForm  from './pages/categories/CategoryForm';
import CategoryView  from './pages/categories/CategoryView';
import BrandList     from './pages/brands/BrandList';
import BrandForm     from './pages/brands/BrandForm';
import BrandView     from './pages/brands/BrandView';
import OrderList     from './pages/orders/OrderList';
import OrderForm     from './pages/orders/OrderForm';
import AreaList      from './pages/areas/AreaList';
import AreaForm      from './pages/areas/AreaForm';
import AreaView      from './pages/areas/AreaView';
import RouteList     from './pages/routes/RouteList';
import RouteView     from './pages/routes/RouteView';
import RouteForm     from './pages/routes/RouteForm';
import WarehouseList from './pages/warehouses/WarehouseList';
import WarehouseForm from './pages/warehouses/WarehouseForm';
import WarehouseView from './pages/warehouses/WarehouseView';
import ReturnList from './pages/returns/ReturnList';
import ReturnForm from './pages/returns/ReturnForm';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import UserView from './pages/users/UserView';
import RoleList from './pages/roles/RoleList';
import RoleForm from './pages/roles/RoleForm';
import RoleView from './pages/roles/RoleView';
import SalesmanList from './pages/salesman/SalesmanList';
import SalesmanForm from './pages/salesman/SalesmanForm';
import SalesmanView from './pages/salesman/SalesmanView';
import UomList from './pages/uom/UomList';
import UomForm from './pages/uom/UomForm';
import UomView from './pages/uom/UomView';
import ReportsLayout from './pages/reports/ReportsLayout';
import ReportCatalogPage from './pages/reports/ReportCatalogPage';
import ReportViewPage from './pages/reports/ReportViewPage';
import MisReportSectionPage from './pages/reports/mis/MisReportSectionPage';
import { MIS_REPORT_SECTIONS } from './lib/reporting/misSections';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import Register from './pages/auth/Register';

setupIonicReact({ mode: 'md' });

// Routes that should collapse the split pane (full-width drawer-only pages)
const DRAWER_ONLY_ROUTES: string[] = [];

const AUTH_ROUTES = ['/login', '/forgot-password', '/register'];

function AppContent() {
  const location = useLocation();

  const isAuthRoute = AUTH_ROUTES.some(r =>
    location.pathname === r || location.pathname.startsWith(r + '/')
  );

  const isDrawerOnly = DRAWER_ONLY_ROUTES.some(r =>
    location.pathname === r || location.pathname.startsWith(r + '/')
  );

  // Auth pages render full-screen, no shell
  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    );
  }

  return (
    <ProtectedRoute>
      <IonSplitPane contentId="main-content" when={isDrawerOnly ? false : 'md'}>
        <Menu />

        <div id="main-content" className="flex flex-col h-full overflow-hidden bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
          <Routes>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<ReportsLayout />}>
              <Route index element={<ReportCatalogPage />} />
              <Route path="mis-report" element={<MisReportSectionPage />} />
              {MIS_REPORT_SECTIONS.map((section) => (
                <Route
                  key={section.slug}
                  path={section.slug}
                  element={<MisReportSectionPage />}
                />
              ))}
              <Route path=":slug" element={<ReportViewPage />} />
            </Route>
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/view/:uuid" element={<CustomerView />} />
            <Route path="/customers/add" element={<CustomerForm />} />
            <Route path="/customers/edit/:id" element={<CustomerForm />} />
            <Route path="/items" element={<ItemList />} />
            <Route path="/items/add" element={<ItemForm />} />
            <Route path="/items/view/:id" element={<ItemView />} />
            <Route path="/items/edit/:id" element={<ItemForm />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/categories/add" element={<CategoryForm />} />
            <Route path="/categories/view/:id" element={<CategoryView />} />
            <Route path="/categories/edit/:id" element={<CategoryForm />} />
            <Route path="/brands" element={<BrandList />} />
            <Route path="/brands/add" element={<BrandForm />} />
            <Route path="/brands/view/:id" element={<BrandView />} />
            <Route path="/brands/edit/:id" element={<BrandForm />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/add" element={<OrderForm />} />
            <Route path="/orders/edit/:id" element={<OrderForm />} />
            <Route path="/areas" element={<AreaList />} />
            <Route path="/areas/add" element={<AreaForm />} />
            <Route path="/areas/view/:id" element={<AreaView />} />
            <Route path="/areas/edit/:id" element={<AreaForm />} />
            <Route path="/routes" element={<RouteList />} />
            <Route path="/routes/add" element={<RouteForm />} />
            <Route path="/routes/view/:id" element={<RouteView />} />
            <Route path="/routes/edit/:id" element={<RouteForm />} />
            <Route path="/warehouses" element={<WarehouseList />} />
            <Route path="/warehouses/add" element={<WarehouseForm />} />
            <Route path="/warehouses/view/:id" element={<WarehouseView />} />
            <Route path="/warehouses/edit/:id" element={<WarehouseForm />} />
            <Route path="/returns" element={<ReturnList />} />
            <Route path="/returns/add" element={<ReturnForm />} />
            <Route path="/returns/edit/:id" element={<ReturnForm />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/users/add" element={<UserForm />} />
            <Route path="/users/view/:id" element={<UserView />} />
            <Route path="/users/edit/:id" element={<UserForm />} />
            <Route path="/roles" element={<RoleList />} />
            <Route path="/roles/add" element={<RoleForm />} />
            <Route path="/roles/view/:id" element={<RoleView />} />
            <Route path="/roles/edit/:id" element={<RoleForm />} />
            <Route path="/salesman" element={<SalesmanList />} />
            <Route path="/salesman/add" element={<SalesmanForm />} />
            <Route path="/salesman/view/:id" element={<SalesmanView />} />
            <Route path="/salesman/edit/:id" element={<SalesmanForm />} />
            <Route path="/uom" element={<UomList />} />
            <Route path="/uom/add" element={<UomForm />} />
            <Route path="/uom/view/:id" element={<UomView />} />
            <Route path="/uom/edit/:id" element={<UomForm />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </IonSplitPane>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <LoadingProvider>
            <AxiosLoadingInterceptor />
            <IonApp>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </IonApp>
          </LoadingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
