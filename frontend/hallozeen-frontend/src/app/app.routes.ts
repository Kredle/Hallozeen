import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { RegisterSuccessComponent } from './features/auth/register/register-success/register-success.component';
import { LoginComponent } from './features/auth/login/login.component';
import { LoginSuccessComponent } from './features/auth/login/login-success/login-success.component';
import { ProductsComponent } from './features/products/products.component';
import { AdComponent } from './features/ad/ad.component';
import { authGuard } from './features/auth/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register/success', component: RegisterSuccessComponent },
  { path: 'login', component: LoginComponent },
  { path: 'login/success', component: LoginSuccessComponent },
  { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
  { path: 'ad', component: AdComponent }
];
