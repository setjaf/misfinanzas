import React from 'react';
import Ingresos from './Ingresos/Ingresos';

let Resumen = (props) =>{ 
  return(
    <div>
      <h1>Hola has entrado</h1>
      <Ingresos uid={props.uid} presupuestoId={props.presupuestoId}/>
    </div>
    
  );
}

export default Resumen;