import { Button } from 'reactstrap';
import React from 'react';

export default function UserBtn({ name, id, setUser }) {
  return (
    <Button size="sm" className="font-weight-bold" onClick={() => setUser(id)}>
      {name}
    </Button>
  );
}
