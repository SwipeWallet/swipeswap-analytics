import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import { Box, TextField } from "@material-ui/core";
/* eslint-disable no-use-before-define */
import React from "react";

import PairIcon from "./PairIcon";
import { TokenIcon } from "app/components";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import { useRouter } from "next/router";

export default function Search({ pairs, tokens }) {
  const router = useRouter();

  const options = [
    ...pairs,
    ...tokens,
  ].map((option) => {
    return {
      __typename: option.__typename,
      id: option.id,
      token0: option.token0 ? option.token0.id : "",
      token1: option.token1 ? option.token1.id : "",
      text: option.name
        ? ` ${option.symbol} ${option.name}`
        : `${option.token0?.symbol}-${option.token1?.symbol}`,
    };
  });

  const filterOptions = createFilterOptions({
    matchFrom: "start",
    stringify: (option) => option.text,
  });

  return (
    <Autocomplete
      id="search"
      filterOptions={filterOptions}
      options={options.sort((a, b) => {
        if (a.__typename === "Token" && b.__typename === "Pair") {
          return -1;
        }
      })}
      groupBy={(option) => option.__typename}
      getOptionLabel={(option) => option.text}
      style={{ width: "100%" }}
      onChange={(e, v) => {
        router.push(`/${v.__typename.toLowerCase()}s/${v.id}`);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search pairs and tokens"
          variant="outlined"
          size="small"
        />
      )}
      renderOption={(option, { inputValue }) => {
        const matches = match(option.text, inputValue);
        const parts = parse(option.text, matches);
        return (
          <Box display="flex" alignItems="center">
            {option.__typename === "Token" ? (
              <TokenIcon id={option.id} />
            ) : (
              <PairIcon base={option.token0} quote={option.token1} />
            )}
            {parts.map((part, index) => (
              <span
                key={index}
                style={{ fontWeight: part.highlight ? 700 : 400 }}
              >
                {part.text}
              </span>
            ))}
          </Box>
        );
      }}
    />
  );
}
