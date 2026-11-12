import { CheckIcon } from './Icons.jsx';

const STEPS = [
  { id: 1, label: 'Производители' },
  { id: 2, label: 'Аналоги и предложения' },
];

/**
 * Показывает, на каком из двух этапов подбора находится пользователь.
 * @param {{ step: 1 | 2 }} props
 */
export default function StepIndicator({ step }) {
  return (
    <ol className="steps" aria-label="Этапы подбора">
      {STEPS.map(({ id, label }) => {
        const state = id < step ? 'done' : id === step ? 'current' : 'next';
        return (
          <li
            key={id}
            className="step"
            data-state={state}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className="step__num">{state === 'done' ? <CheckIcon size={14} /> : id}</span>
            <span className="step__label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
