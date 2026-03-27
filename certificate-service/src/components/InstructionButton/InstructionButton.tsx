import styles from './InstructionButton.styles.module.less';
import moderatorInstruction from '~/files/moderatorInstruction.pdf';
import orgCommitteeInstruction from '~/files/orgCommitteeInstruction.pdf';
import expertInstruction from '~/files/expertInstruction.pdf';

interface InstructionButtonProps {
  type: 'moderator' | 'org-committee' | 'expert';
}

const InstructionButton = ({ type }: InstructionButtonProps) => {
  const getInstructionFile = () => {
    switch (type) {
      case 'moderator':
        return moderatorInstruction;
      case 'org-committee':
        return orgCommitteeInstruction;
      case 'expert':
        return expertInstruction;
      default:
        return '';
    }
  };

  const handleOpenFile = () => {
    const fileUrl = getInstructionFile();
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div
      className={`bt ${styles.instructionStyle}`}
      onClick={handleOpenFile}
      style={{ cursor: 'pointer' }}
    >
      Инструкция
    </div>
  );
};

export default InstructionButton;
