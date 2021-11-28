import { useReducer } from "react"
import DigitButton from "./digitbutton"
import OperationButton from "./operationbutton"
import "./styles.css"


export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CLEAR: 'clear',
  DEL_DIGIT: 'del-digit',
  OPERATION: 'operation',
  EVALUATE: 'evaluate'
}

function reducer(state, {type, payload}) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      //if starting new operation this overwrites previous.
      if (state.overwrite) {
        return {
          ...state,
          currOperand: payload.digit,
          overwrite: false,
        }
      }

      // Need edge cases to stop repeating decimals and numbers beginning with 0.
      if (payload.digit === "0" && state.currOperand ==="0") {return state }

      // if (payload.digit === "." && state.currOperand === ".") { return state }

      if (payload.digit === "." && state.currOperand.includes(".")){ return state }

      return {
        ...state,
        currOperand: `${state.currOperand || ""}${payload.digit}`,
      }
    case ACTIONS.OPERATION:
        //Makes sure that digits must be entered before operand
        if (state.currOperand == null && state.prevOperand == null) {
          return state
        }
        
        //handles correction of wrong operand input
        if (state.currOperand == null) {
          return {
            ...state,
            operation: payload.operation,
          }
        }

        //Makes the current thing the previous one
        if(state.prevOperand == null) {
          return {
            ...state,
            operation: payload.operation,
            prevOperand: state.currOperand,
            currOperand: null
          }
        }

        //handles a 3rd (or more) row of operation by calculating the previous two rows into one
        return {
          ...state,
          prevOperand: evaluate(state),
          operation: payload.operation,
          currOperand: null
        }
    case ACTIONS.CLEAR:
        return {}

    case ACTIONS.DEL_DIGIT:
        if (state.overwrite) {return { ...state, overwrite: false, currOperand: null}}

        if (state.currOperand == null) return state
        if (state.currOperand.length === 1){
          return {...state, currOperand: null}
        }
        return {
          ...state,
          currOperand: state.currOperand.slice(0, -1)
        }

    case ACTIONS.EVALUATE:
        if (state.operation == null || state.currOperand == null || state.prevOperand == null){
          return state
        }

        return {
          ...state,
          overwrite: true,
          prevOperand: null,
          operation: null,
          currOperand: evaluate(state),
        }
  }

}

function evaluate({ currOperand, prevOperand, operation}) {
  const prev = parseFloat(prevOperand)
  const curr = parseFloat(currOperand)
  if (isNaN(prev) || isNaN(curr)) return ""

  let computation = ""
  switch (operation) {
    case "÷":
      computation = prev / curr
      break
    case "*":
      computation = prev * curr
      break
    case "+":
      computation = prev + curr
      break
    case "-":
      computation = prev - curr
      break
  }

  return computation.toString()
}


const INT_FORMAT = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
})

function formatOperand(operand) {
  if (operand == null) return ""
  const [integer, decimal] = operand.split('.')
  if (decimal == null) return INT_FORMAT.format(integer)
  return `${INT_FORMAT.format(integer)}.${decimal}`
}

 {/*RENDERS ENTIRE APPLICATION */}
function App() {
  const [{currOperand, prevOperand, operation}, dispatch] = useReducer(reducer, {})

 
  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="prev-operand">{formatOperand(prevOperand)} {operation}</div>
        <div className="curr-operand">{formatOperand(currOperand)}</div>

      </div>
    {/*Calculator buttons
      The span-two class is used to denote buttons which span two tiles. */}
    <button className="span-two" onClick={() => dispatch({ type: ACTIONS.CLEAR})}>AC</button>
    <button onClick={() => dispatch({ type: ACTIONS.DEL_DIGIT})}>DEL</button>
    <OperationButton operation="÷" dispatch={dispatch} /> 

    <DigitButton digit="1" dispatch={dispatch} />
    <DigitButton digit="2" dispatch={dispatch} />
    <DigitButton digit="3" dispatch={dispatch} />

    <OperationButton operation="*" dispatch={dispatch} /> 
    <DigitButton digit="4" dispatch={dispatch} />
    <DigitButton digit="5" dispatch={dispatch} />
    <DigitButton digit="6" dispatch={dispatch} />

    <OperationButton operation="+" dispatch={dispatch} /> 
    <DigitButton digit="7" dispatch={dispatch} />
    <DigitButton digit="8" dispatch={dispatch} />
    <DigitButton digit="9" dispatch={dispatch} />

    <OperationButton operation="-" dispatch={dispatch} /> 
    <DigitButton digit="." dispatch={dispatch} />
    <DigitButton digit="0" dispatch={dispatch} />
    <button  className="span-two" onClick={() => dispatch({ type: ACTIONS.EVALUATE})}>=</button>

    <div className="footer">
    <p>designed by <a target="_blank" href="https://nickmarriott.com/">Nick Marriott</a></p>
    </div>
    </div>

    
  );
}

export default App;
