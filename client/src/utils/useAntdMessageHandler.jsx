import { message } from "antd";

export const useAntdMessageHandler = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const showCustomMessage = (customMessage, duration) => {
    messageApi.success({
      type: "success",
      content: (
        <div>
          <span className="fs-15 lh-20">{customMessage}</span>
        </div>
      ),
      duration: duration,
      className: "custom-message-style chirp-regular-font",
    });
  };

  return {
    showCustomMessage,
    contextHolder,
  };
};
