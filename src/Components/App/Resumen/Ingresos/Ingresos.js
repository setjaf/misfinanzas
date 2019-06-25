import React, {Component} from 'react';
import firebase from '../../../../Utils/firebase';
import {FDtoJSON} from '../../../../Utils/FDtoJSON';

const db = firebase.firestore();

export default class Ingresos extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ingresos:[],
    }
    
    this.registrarIngreso = this.registrarIngreso.bind(this);
    this.borrarIngreso = this.borrarIngreso.bind(this);
    this.inicializarIngresos = this.inicializarIngresos.bind(this);
  }  

  componentDidMount(){
    this.inicializarIngresos();
  }

  inicializarIngresos(){
    const esto = this;
    let ingresos = db.collection('Usuarios').doc(this.props.uid).collection('Presupuestos').doc(this.props.presupuestoId).collection('Ingresos');
    ingresos.get().then((qs)=>{
      let ingresos = [];
        qs.docs.map(
          (doc)=>{
            const data = doc.data();
            let ingreso = {...data}
            ingreso.id = doc.id;
            ingreso.registro = ingreso.registro.toDate();
            ingresos.push(ingreso);
            return ingreso;
          }
        );
        esto.setState({
          ingresos:ingresos,
        });
    })
  }

  registrarIngreso(event){
    const esto = this;

    event.preventDefault();

    let ingresos = this.state.ingresos.slice(0,this.state.ingresos.length);
    
    let ingreso = FDtoJSON(new FormData(event.target));

    ingreso.registro = firebase.firestore.Timestamp.now();    

    let presupuesto = db.collection('Usuarios').doc(this.props.uid).collection('Presupuestos').doc(this.props.presupuestoId);
    
    db.runTransaction(
      function (transaction) {
        return transaction.get(presupuesto).then(
          (doc)=>{
            transaction.update(presupuesto,
              {
                dineroDisponible:Number(doc.data().dineroDisponible)+Number(ingreso.importe),
                dineroLibre:Number(doc.data().dineroLibre)+Number(ingreso.importe),
              }
            );
          }
        );
      }
    );    
    
    presupuesto.collection('Ingresos').add(ingreso).then(
      (docRef)=>{

        alert('Ingreso guardado');

        ingreso.id = docRef.id;
        ingreso.registro = ingreso.registro.toDate();
        ingresos.push(
          ingreso
        );

        esto.setState({
          ingresos:ingresos,
        });

      }
    ).catch(
      (a)=>{
        alert(a);
        alert('No se pudo guardar el ingreso')
      }
    );
    event.target.reset();
  }

  borrarIngreso(ingreso){

    const esto = this;

    let ingresos = this.state.ingresos.slice(0,this.state.ingresos.length);

    let presupuesto = db.collection('Usuarios').doc(this.props.uid).collection('Presupuestos').doc(this.props.presupuestoId);

    console.log(ingresos);
    console.log(ingreso);

    db.runTransaction(
      function (transaction) {
        return transaction.get(presupuesto).then(
          (doc)=>{
            transaction.update(presupuesto,
              {
                dineroDisponible:Number(doc.data().dineroDisponible)-Number(ingresos[ingreso].importe),
                dineroLibre:Number(doc.data().dineroLibre)-Number(ingresos[ingreso].importe),
              }
            );
          }
        );
      }
    );

    presupuesto.collection('Ingresos').doc(ingresos[ingreso].id).delete().then(
      ()=>{
        ingresos.splice(ingreso,1);

        esto.setState({
          ingresos:ingresos,
        });
      }
    );

  }

  render(){
    return(
      <div>
          <form onSubmit={this.registrarIngreso}>
            <h4>Ingresos fijos en el periodo:</h4>

            <div>
              <label>
                Concepto:
              </label>
              <input type="text" name="concepto" required/>
            </div>

            <div>
              <label>
                Importe:
              </label>
              <input type="text" name="importe" required/>
            </div>

            <input type="submit" value="Enviar"/>
          </form>
          <table>
            <thead>
              <tr>
                <td>Concepto</td>
                <td>Importe</td>
                <td>Periodicidad</td>
                <td>Día de pago</td>
              </tr>
            </thead>

            <tbody>
              {
                this.state.ingresos.map(
                  (ingreso, key)=>{
                    return(
                      <tr key={key}>
                        <td>{ingreso.concepto}</td>
                        <td>${ingreso.importe}</td>
                        <td>{`${ingreso.registro.getFullYear()}-${ingreso.registro.getMonth()+1<10?'0':''}${ingreso.registro.getMonth()+1}-${ingreso.registro.getDate()<10?'0':''}${ingreso.registro.getDate()}`}</td>
                        <td><button onClick={()=>this.borrarIngreso(key)}>Borrar</button></td>
                      </tr>
                    );
                  }
                )
              }
            </tbody>

          </table>       

        </div>
    );
  }
  
}