import React from 'react'

import styles from './popup.css'

export function Popup({ options }) {
  const Item = ({ key, action, name }) => (
    <li key={key} className={styles.action} onClick={action}>
      <span className={styles.name}>{name}</span>
      <span className={styles.key}>{key}</span>
    </li>
  )

  return <ul className={styles.popup}>{options && options.map(Item)}</ul>
}
