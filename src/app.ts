import express from 'express';

const app = express();

app.get('./', (req, res) => {
  res.send('welcome from auth');
});

export default app;
