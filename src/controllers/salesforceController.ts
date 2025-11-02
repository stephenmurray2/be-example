import { Request, Response } from 'express';
import { salesforceService } from '../services/salesforceService.js';

// Account Controllers
export const createAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const account = await salesforceService.createAccount(req.body);
    res.status(201).json(account);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({
      error: 'Failed to create account',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const account = await salesforceService.getAccount(id);

    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    res.status(200).json(account);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      error: 'Failed to get account',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const listAccounts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const accounts = await salesforceService.listAccounts(limit, offset);
    res.status(200).json({
      data: accounts,
      pagination: {
        limit,
        offset,
        count: accounts.length,
      },
    });
  } catch (error) {
    console.error('List accounts error:', error);
    res.status(500).json({
      error: 'Failed to list accounts',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const account = await salesforceService.updateAccount(id, req.body);

    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    res.status(200).json(account);
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({
      error: 'Failed to update account',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await salesforceService.deleteAccount(id);

    if (!success) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Contact Controllers
export const createContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const contact = await salesforceService.createContact(req.body);
    res.status(201).json(contact);
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      error: 'Failed to create contact',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const contact = await salesforceService.getContact(id);

    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      error: 'Failed to get contact',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const listContacts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const accountId = req.query.accountId as string;

    let contacts;
    if (accountId) {
      contacts = await salesforceService.getContactsByAccount(accountId);
    } else {
      contacts = await salesforceService.listContacts(limit, offset);
    }

    res.status(200).json({
      data: contacts,
      pagination: {
        limit,
        offset,
        count: contacts.length,
      },
    });
  } catch (error) {
    console.error('List contacts error:', error);
    res.status(500).json({
      error: 'Failed to list contacts',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const contact = await salesforceService.updateContact(id, req.body);

    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      error: 'Failed to update contact',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await salesforceService.deleteContact(id);

    if (!success) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      error: 'Failed to delete contact',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Cart Controllers
export const createCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cart = await salesforceService.createCart(req.body);
    res.status(201).json(cart);
  } catch (error) {
    console.error('Create cart error:', error);
    res.status(500).json({
      error: 'Failed to create cart',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cart = await salesforceService.getCart(id);

    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      error: 'Failed to get cart',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const listCarts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const accountId = req.query.accountId as string;

    let carts;
    if (accountId) {
      carts = await salesforceService.getCartsByAccount(accountId);
    } else {
      carts = await salesforceService.listCarts(limit, offset);
    }

    res.status(200).json({
      data: carts,
      pagination: {
        limit,
        offset,
        count: carts.length,
      },
    });
  } catch (error) {
    console.error('List carts error:', error);
    res.status(500).json({
      error: 'Failed to list carts',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const cart = await salesforceService.addToCart(id, req.body);

    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      error: 'Failed to add item to cart',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const removeFromCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const cart = await salesforceService.removeFromCart(id, req.body);

    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      error: 'Failed to remove item from cart',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await salesforceService.deleteCart(id);

    if (!success) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete cart error:', error);
    res.status(500).json({
      error: 'Failed to delete cart',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
