import React, { useState, useEffect, useCallback } from "react";
import { database } from "./firebase";
import {
  Table,
  Space,
  Form,
  Radio,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Popconfirm,
} from "antd";
import {
  GoogleMap,
  useJsApiLoader,
  Circle,
  Marker,
} from "@react-google-maps/api";
const { Column } = Table;

const crimes = database.ref("crimes");

function validateLongitude(num) {
  if (typeof num !== "number") {
    return { validateStatus: "error", errorMsg: "Longitude is not a number" };
  }

  if (num < -180 || num > 180) {
    return {
      validateStatus: "error",
      errorMsg: "Longitude is not in valid range",
    };
  }
  return { validateStatus: "success", errorMsg: null };
}

function validateLatitude(num) {
  if (typeof num !== "number") {
    return { validateStatus: "error", errorMsg: "Latitude is not a number" };
  }

  if (num < -90 || num > 90) {
    return {
      validateStatus: "error",
      errorMsg: "Latitude is not in valid range",
    };
  }
  return { validateStatus: "success", errorMsg: null };
}

const options = {
  fillColor: "#ff0000",
  fillOpacity: 0.35,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  radius: 250,
  zIndex: 1,
};

function App() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAqYoSlP5Y5rTlf_7RLVfkRvGPZGOBWwbg",
  });
  const [map, setMap] = useState(null);
  const [vp, setVp] = useState({ lng: 126.9767, lat: 37.575 });
  const onLoad = useCallback((map) => {
    const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds);
    setMap(map);
  }, []);
  const onUnmount = useCallback((map) => {
    setMap(null);
  }, []);
  const [source, setSource] = useState([]);

  useEffect(() => {
    crimes.on("value", (snapshot) => {
      const obj = snapshot.val() ?? {};
      const arr = Object.entries(obj).map(([id, val]) => {
        const { lng, lat, category, degree, description } = val;
        return { key: id, id, lng, lat, category, degree, description };
      });
      setSource(arr);
    });
  }, []);

  const [form] = Form.useForm();

  const layout = { labelCol: { span: 8 }, wrapperCol: { span: 16 } };
  return (
    <>
      <Row>
        <Col span={4}>
          <Form
            form={form}
            layout="horizontal"
            {...layout}
            initialValues={{ degree: 1 }}
            onFinish={(values) => {
              const lngValidate = validateLongitude(values.lng);
              const latValidate = validateLatitude(values.lat);
              const lngValid = lngValidate.validateStatus === "success";
              const latValid = latValidate.validateStatus === "success";
              if (!lngValid || !latValid) {
                alert(
                  `${!lngValid ? lngValidate.errorMsg : latValidate.errorMsg}`
                );
              } else {
                const newCrimeRef = crimes.push();
                newCrimeRef.set(values);
                form.resetFields();
              }
            }}
          >
            <Form.Item
              label="Longitude"
              name="lng"
              rules={[{ required: true }]}
            >
              <InputNumber placeholder="Longitude" />
            </Form.Item>
            <Form.Item label="Latitude" name="lat" rules={[{ required: true }]}>
              <InputNumber placeholder="Latitude" />
            </Form.Item>
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true }]}
            >
              <Input placeholder="Category" />
            </Form.Item>
            <Form.Item
              label="Degree"
              name="degree"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio.Button value={1}>1</Radio.Button>
                <Radio.Button value={2}>2</Radio.Button>
                <Radio.Button value={3}>3</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true }]}
            >
              <Input placeholder="Description" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col span={20}>
          <Table dataSource={source}>
            <Column title="ID" dataIndex="id" key="id" />
            <Column title="Longitude" dataIndex="lng" key="lng" />
            <Column title="Latitude" dataIndex="lat" key="lat" />
            <Column title="Category" dataIndex="category" key="category" />
            <Column title="Degree" dataIndex="degree" key="degree" />
            <Column
              title="Description"
              dataIndex="description"
              key="description"
            />
            <Column
              title="Action"
              key="action"
              render={(text, record) => (
                <Space size="middle">
                  <Popconfirm
                    title="Are you sure to delete?"
                    onConfirm={() => {
                      crimes.update({ [record.id]: null });
                    }}
                  >
                    <a href="#">Delete</a>
                  </Popconfirm>
                </Space>
              )}
            />
          </Table>
        </Col>
      </Row>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: "400px", height: "400px" }}
          zoom={1}
          //center={{ lng: 126.9767, lat: 37.575 }}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onBoundsChanged={() => {
            const center = map.getCenter();
            setVp({ lng: center.lng(), lat: center.lat() });
          }}
        >
          {source &&
            source.map(({ id, lng, lat }) => (
              <React.Fragment key={`hotspot-${id}`}>
                <Circle options={options} center={{ lng, lat }} />
                <Marker position={{ lng, lat }} />
              </React.Fragment>
            ))}
        </GoogleMap>
      ) : (
        <></>
      )}
      <Space>
        Lng: {vp.lng}
        Lat: {vp.lat}
      </Space>
    </>
  );
}

export default App;
