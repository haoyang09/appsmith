import { Message, Severity } from "entities/AppsmithConsole";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "reducers";

export const SeverityIcon: Record<Severity, string> = {
  [Severity.INFO]: "success",
  [Severity.ERROR]: "error",
  [Severity.WARNING]: "warning",
};

export const SeverityIconColor: Record<Severity, string> = {
  [Severity.INFO]: "#03B365",
  [Severity.ERROR]: "rgb(255, 255, 255)",
  [Severity.WARNING]: "rgb(224, 179, 14)",
};

export const useFilteredLogs = (query: string, filter?: any) => {
  const logs = useSelector((state: AppState) => state.ui.debugger.logs);
  let filteredLogs = [...logs];

  if (filter) {
    filteredLogs = filteredLogs.filter(
      (log: Message) => log.severity === filter,
    );
  }

  if (query) {
    filteredLogs = filteredLogs.filter((log: Message) => {
      if (log.source?.name)
        return log.source?.name.toUpperCase().indexOf(query.toUpperCase()) < 0
          ? false
          : true;
    });
  }

  return filteredLogs;
};

export const usePagination = (data: any, itemsPerPage = 50) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const maxPage = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    const data = currentData();
    setPaginatedData(data);
  }, [currentPage, data.length]);

  function currentData() {
    const end = currentPage * itemsPerPage;
    return data.slice(0, end);
  }

  function next() {
    setCurrentPage((currentPage) => Math.min(currentPage + 1, maxPage));
  }

  return { next, paginatedData };
};