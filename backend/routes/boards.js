const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const Task = require('../models/Task');

router.get('/', async (req, res) => {
  try {
    const boards = await Board.find().sort({ updatedAt: -1 });
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, columns, columnOrder, createdBy } = req.body;
    
    const defaultColumns = [
      { id: 'queue', title: 'Queue', taskIds: [] },
      { id: 'in-progress', title: 'In Progress', taskIds: [] },
      { id: 'done', title: 'Done', taskIds: [] },
    ];
    
    const defaultColumnOrder = ['queue', 'in-progress', 'done'];
    
    const newBoard = new Board({
      name,
      columns: columns || defaultColumns,
      columnOrder: columnOrder || defaultColumnOrder,
      createdBy,
    });
    
    const board = await newBoard.save();
    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, columns, columnOrder } = req.body;
    
    const board = await Board.findByIdAndUpdate(
      req.params.id,
      {
        name,
        columns,
        columnOrder,
        updatedAt: Date.now(),
      },
      { new: true }
    );
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Task.deleteMany({ boardId: req.params.id });
    
    const board = await Board.findByIdAndDelete(req.params.id);
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.json({ message: 'Board removed' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/columns', async (req, res) => {
  try {
    const { columns } = req.body;
    
    const board = await Board.findByIdAndUpdate(
      req.params.id,
      { columns, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.json(board);
  } catch (error) {
    console.error('Error updating board columns:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;