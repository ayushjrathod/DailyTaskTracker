"use client";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}

export function CustomCheckbox({ checked, onChange, id }: CustomCheckboxProps) {
  return (
    <div className="checkbox-wrapper-61">
      <input checked={checked} className="check" id={id} type="checkbox" onChange={(e) => onChange(e.target.checked)} />
      <label className="label" htmlFor={id}>
        <svg height="45" viewBox="0 0 95 95" width="45">
          <rect fill="none" height="50" stroke="currentColor" width="50" x="30" y="20" className="checkbox-rect" />
          <g transform="translate(0,-952.36222)">
            <path
              className="path1"
              d="m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </g>
        </svg>
      </label>
      <style jsx>{`
        .checkbox-wrapper-61 input[type="checkbox"] {
          visibility: hidden;
          display: none;
        }

        .checkbox-wrapper-61 *,
        .checkbox-wrapper-61 ::after,
        .checkbox-wrapper-61 ::before {
          box-sizing: border-box;
        }

        .checkbox-wrapper-61 {
          position: relative;
          display: block;
          overflow: hidden;
        }

        .checkbox-wrapper-61 .check {
          width: 50px;
          height: 50px;
          position: absolute;
          opacity: 0;
        }

        .checkbox-wrapper-61 .label svg {
          vertical-align: middle;
        }

        .checkbox-wrapper-61 .path1 {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          transition: 3s stroke-dashoffset;
          opacity: 0;
        }

        .checkbox-wrapper-61 .check:checked + label svg g path {
          stroke-dashoffset: 0;
          opacity: 1;
        }

        .checkbox-wrapper-61 .checkbox-rect {
          stroke: currentColor;
        }

        .checkbox-wrapper-61 .check:checked + label .checkbox-rect {
          stroke: currentColor;
        }

        .checkbox-wrapper-61 .check:checked + label svg g path {
          stroke: currentColor;
        }
      `}</style>
    </div>
  );
}
