import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { RegisterSuccessComponent } from './features/auth/register/register-success/register-success.component';
import { LoginComponent } from './features/auth/login/login.component';
import { LoginSuccessComponent } from './features/auth/login/login-success/login-success.component';
import { ProductsComponent } from './features/products/products.component';
import { ShoppingBag } from './features/shopping-bag/shopping-bag';
import { CheckoutComponent } from './features/checkout/checkout';
import { OrderSuccessComponent } from './features/checkout/order-success/order-success.component';
import { AdComponent } from './features/ad/ad.component';
import { authGuard } from './features/auth/auth.guard';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register/success', component: RegisterSuccessComponent },
  { path: 'login', component: LoginComponent },
  { path: 'login/success', component: LoginSuccessComponent },
  { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
  { path: 'shopping-bag', component: ShoppingBag, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'order/success', component: OrderSuccessComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'ad', component: AdComponent }
];
