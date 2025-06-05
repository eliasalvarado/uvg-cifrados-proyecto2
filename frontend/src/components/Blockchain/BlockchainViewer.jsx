import React, { useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import useToken from "../../hooks/useToken";
import consts from "../../helpers/consts";
import styles from "./BlockchainViewer.module.css";       // crea tu CSS-module

function BlockchainViewer() {
  const token = useToken();

  /* useFetch para llamar al endpoint */
  const {
    callFetch,
    result: chainData,
    error,
    loading,
    reset,
  } = useFetch();

  /* Traer la cadena al montar / cuando el token cambie */
  useEffect(() => {
    if (!token) return;
    reset();
    callFetch({
      uri: `${consts.apiPath}/transactions`,
      method: "GET",
      headers: { Authorization: token },
    });
  }, [token]);

  /* Short-cuts */
  const chain = chainData?.chain ?? [];
  const validation = chainData?.validation ?? { ok: true };

  /* Índice desde el que la cadena está dañada */
  const badFrom = validation.ok ? null : validation.firstTamperedIndex;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Blockchain interna</h1>

      {loading && <p>Cargando…</p>}
      {error && <p className={styles.error}>Error: {error.message}</p>}

      {chain.length > 0 && (
        <>
          {/* Estado global */}
          <div
            className={`${styles.badge} ${
              validation.ok ? styles.ok : styles.bad
            }`}
          >
            {validation.ok ? "Cadena íntegra ✅" : "Cadena corrupta ⚠️"}
          </div>

          {/* Tabla de bloques */}
          <div className={`${styles.tableWrapper} ${styles.scroll}`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Timestamp</th>
                  <th className={styles.hashCol}>Prev Hash</th>
                  <th className={styles.hashCol}>Hash</th>
                  <th>From</th>
                  <th>To</th>
                  <th className={styles.hashCol}>msgHash</th>
                </tr>
              </thead>
              <tbody>
                {chain.map((blk) => {
                  const broken = badFrom !== null && blk.block_index >= badFrom;
                  const data =
                         typeof blk.data === "string" ? JSON.parse(blk.data) : blk.data;
                  return (
                    <tr
                      key={blk.id}
                      className={broken ? styles.rowBroken : styles.rowOk}
                    >
                      <td>{blk.block_index}</td>
                      <td>
                        {new Date(Number(blk.timestamp)).toLocaleString()}
                      </td>
                      <td className={styles.hashCell}>{blk.prev_hash}</td>
                      <td className={styles.hashCell}>{blk.hash}</td>
                      <td>{data.from}</td>
                      <td>{data.to}</td>
                      <td className={styles.hashCell}>{data.msgHash}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default BlockchainViewer;
