import React, { useReducer, useEffect } from "react"
import axios from "axios"
import reducer, { defaultState } from "./reducer"
import Swal from "sweetalert2"
import ctc from "copy-to-clipboard"
import PropTypes from "prop-types"

const Toast = Swal.mixin({
  toast: true,
  position: "center",
  showConfirmButton: false,
  timer: 3000,
})

const metricClassStyle = "tag is-dark is-large"

const copy = text => {
  try {
    ctc(text)
    Toast.fire({
      type: "success",
      title: "Copied",
    })
  } catch (e) {
    console.log("Copy failed", e)
    Toast.fire({
      type: "error",
      title: "Copy Failed",
    })
  }
}

const Metric = props => {
  const [state, dispatch] = useReducer(reducer, defaultState)

  useEffect(() => {
    if (!state.metricValue) {
      axios
        .get(props.endpointUri)
        .then(({ data: payload }) => {
          dispatch({ type: "SET_METRIC_VALUE", payload })
        })
        .catch(payload => dispatch({ type: "SET_METRIC_FAILED", payload }))
    }
  }, [state.metricValue, props.endpointUri, dispatch])

  if (state.failedMessage) {
    return (
      <>
        <code
          readOnly
          className={`${metricClassStyle} has-text-centered is-borderless`}
        >
          Undetected
        </code>
        <p className="help">{state.failedMessage}</p>
      </>
    )
  }

  if (state.isLoading) {
    return (
      <>
        <code className={`${metricClassStyle} button is-loading`}>
          Detecting...
        </code>
        <p className="help">
          Detecting {props.metricName}
          <noscript> (requires JavaScript)</noscript>
          &hellip;
        </p>
      </>
    )
  }

  return (
    <>
      <div className="field has-addons has-addons-centered">
        <p className="control ">
          <a
            href="https://www.iplocation.info"
            target="_blank"
            rel="noopener noreferrer"
            className={`${metricClassStyle} button`}
            title="See the IP location"
            style={{ textDecoration: "none" }}
          >
            <i className="icon-map-pin-streamline" />
          </a>
        </p>
        <p className="control ">
          <code
            onClick={() => copy(state.metricValue)}
            className={`${metricClassStyle} input`}
            title="Click to copy"
            style={{ cursor: "copy" }}
          >
            {state.metricValue}
          </code>
        </p>
        <p className="control ">
          <button
            className={`${metricClassStyle} button`}
            title="Re-detect the IP"
          >
            <i className="icon-refresh" />
          </button>
        </p>
      </div>

      <p className="help">click to copy</p>
    </>
  )
}

const ShowMetric = props => {
  return (
    <div className="field">
      <label className="label">{props.label}</label>
      <div className="control has-text-centered">
        <Metric {...props} />
      </div>
    </div>
  )
}

export default ShowMetric

ShowMetric.propTypes = {
  label: PropTypes.string.isRequired,
}

Metric.propTypes = {
  endpointUri: PropTypes.string.isRequired,
  metricName: PropTypes.string.isRequired,
}
