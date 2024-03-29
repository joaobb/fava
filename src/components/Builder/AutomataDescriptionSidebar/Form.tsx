import { Label, Select, Textarea, TextInput } from "flowbite-react";
import { ExercisePrivacy } from "../../../enums/Exercise";
import { ClassroomSelector } from "../../Exercises/ClassroomSelector";
import React from "react";

interface AutomataDescriptionFormProps {
  title: string;
  description: string;
  privacy: string;
  classroomPrivate: number | null;
  onUpdateTitle(title: string): void;
  onUpdateDescription(description: string): void;
  onUpdatePrivacy(privacy: string): void;
  onUpdateClassroomPrivate(classroomPrivate: number | null): void;
}

const AutomataDescriptionForm: React.FC<AutomataDescriptionFormProps> = ({
  title,
  description,
  privacy,
  classroomPrivate,
  onUpdateTitle,
  onUpdateDescription,
  onUpdatePrivacy,
  onUpdateClassroomPrivate,
}) => {
  return (
    <div className={"text-gray-100 flex flex-col gap-6 h-full"}>
      <div>
        <Label htmlFor={"automata-title"} className={"text-lg font-bold"}>
          Título do exercício
        </Label>
        <TextInput
          maxLength={48}
          id={"automata-title"}
          required={true}
          value={title}
          onInput={(ev) => onUpdateTitle((ev.target as HTMLInputElement).value)}
        />
      </div>

      <div className={"flex flex-col h-full"}>
        <Label htmlFor={"automata-description"} className={"text-lg font-bold"}>
          Descrição do automato
        </Label>
        <Textarea
          id="automata-description"
          className={"h-full"}
          required={true}
          value={description}
          onInput={(ev) =>
            onUpdateDescription((ev.target as HTMLTextAreaElement).value)
          }
        />
      </div>

      <hr className={"mt-auto"} />

      <div>
        <span className={"text-lg font-bold"}>Preferências</span>

        <div>
          <Label htmlFor={"privacy-selector"}>Privacidade</Label>
          <Select
            value={privacy}
            onChange={(ev) => onUpdatePrivacy(ev.target.value)}
          >
            <option value={ExercisePrivacy.public}>Público</option>
            <option value={ExercisePrivacy.classroomPrivate}>
              Privado para turma
            </option>
          </Select>

          {privacy === ExercisePrivacy.classroomPrivate ? (
            <ClassroomSelector
              labeled
              mentoredOnly
              classroom={classroomPrivate}
              onSelectClassroom={(ev) => onUpdateClassroomPrivate(ev)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export { AutomataDescriptionForm };
