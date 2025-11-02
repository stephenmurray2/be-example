import { Router } from 'express';
import {
  createAccount,
  getAccount,
  listAccounts,
  updateAccount,
  deleteAccount,
  createContact,
  getContact,
  listContacts,
  updateContact,
  deleteContact,
  createCart,
  getCart,
  listCarts,
  addToCart,
  removeFromCart,
  deleteCart,
} from '../controllers/salesforceController.js';

const router = Router();

// Account routes
router.post('/accounts', createAccount);
router.get('/accounts', listAccounts);
router.get('/accounts/:id', getAccount);
router.put('/accounts/:id', updateAccount);
router.patch('/accounts/:id', updateAccount);
router.delete('/accounts/:id', deleteAccount);

// Contact routes
router.post('/contacts', createContact);
router.get('/contacts', listContacts);
router.get('/contacts/:id', getContact);
router.put('/contacts/:id', updateContact);
router.patch('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);

// Cart routes
router.post('/carts', createCart);
router.get('/carts', listCarts);
router.get('/carts/:id', getCart);
router.post('/carts/:id/items', addToCart);
router.delete('/carts/:id/items', removeFromCart);
router.delete('/carts/:id', deleteCart);

export default router;
