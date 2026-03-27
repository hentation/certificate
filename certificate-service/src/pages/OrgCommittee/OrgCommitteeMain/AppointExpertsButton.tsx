import { useNavigate } from "react-router-dom";
import paths from "~/routing/paths";
// @ts-expect-error Missing type definitions for urfu-ui-kit-react
import { Button, Tooltip } from "urfu-ui-kit-react";

export function AppointExpertsButton({
  id,
  hasExperts,
  tooltipShow
}: {
  id: string;
  hasExperts: boolean;
  tooltipShow: boolean
}) {
  const navigate = useNavigate();
  return (
    <Tooltip tooltipText={tooltipShow ? 'Посмотреть' : hasExperts ? 'Изменить' : 'Добавить'} id={`${id}${hasExperts ? 'yes' : 'no'}`} portalOn>
      <Button
        icon={hasExperts ? "people" : "participant"}
        iconSize="20px"
        size="small"
        className={hasExperts ? "button-icon-check" : ""}
        variant="icon"
        onClick={() => navigate(paths.orgCommittee.putExperts(id))}
      />
    </Tooltip>
  );
}
