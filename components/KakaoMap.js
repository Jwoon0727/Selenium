"use client"

import { useEffect, useRef, useState } from "react"
import AddressTable from './AddressTable';

const KakaoMap = ({ enableDrawingTools = false, enableInfoWindow = true, initializeMap = true, onAddressesFound }) => {
  const mapRef = useRef(null) // 지도 객체 참조
  const managerRef = useRef(null) // Drawing Manager 참조
  const markerRef = useRef(null) // 마커 객체 참조
  const infowindowRef = useRef(null) // 정보창 객체 참조

  const [polygonCreated, setPolygonCreated] = useState(false) // 폴리곤 생성 여부
  const [activeButton, setActiveButton] = useState(null) // 활성화된 버튼 상태
  const [markers, setMarkers] = useState([]); // 생성된 마커들을 저장할 상태
  const [infoWindows, setInfoWindows] = useState([]); // 생성된 인포윈도우들을 저장할 상태
  const [addresses, setAddresses] = useState([]); // 도로명 주소 목록을 저장할 상태

  useEffect(() => {
    const createMap = async () => {
      if (window.kakao && window.kakao.maps) {
        const container = document.getElementById("map")
        const options = {
          center: new window.kakao.maps.LatLng(36.8396345, 127.142699), // 초기 중심 좌표
          level: 3,
        }

        // 지도 객체 초기화
        if (initializeMap && !mapRef.current) {
          mapRef.current = new window.kakao.maps.Map(container, options)
          console.log("Map initialized:", mapRef.current) // 지도 초기화 로그
        }

        // Drawing Manager 설정
        if (enableDrawingTools) {
          const drawingOptions = {
            map: mapRef.current,
            drawingMode: [window.kakao.maps.Drawing.OverlayType.MARKER, window.kakao.maps.Drawing.OverlayType.POLYGON],
            markerOptions: {
              draggable: true,
              removable: true,
            },
            polygonOptions: {
              draggable: false,
              removable: true,
              editable: true,
              strokeColor: "#39f",
              fillColor: "#cce6ff",
              fillOpacity: 0.7,
            },
          }

          // Drawing Manager 생성
          managerRef.current = new window.kakao.maps.Drawing.DrawingManager(drawingOptions)

          // Toolbox 생성 (Drawing 도구)
          const toolbox = new window.kakao.maps.Drawing.Toolbox({ drawingManager: managerRef.current })

          // Toolbox 지도에 추가
          mapRef.current.addControl(toolbox.getElement(), window.kakao.maps.ControlPosition.TOPRIGHT)

          toolbox.getElement().style.display = "none" // Toolbox 전체를 숨기고 싶을 때 사용
          // Drawing 완료 후 발생하는 이벤트 리스너 추가

          window.kakao.maps.event.addListener(managerRef.current, "drawend", (data) => {
            if (data.overlayType === window.kakao.maps.Drawing.OverlayType.POLYGON) {
              setPolygonCreated(true) // 폴리곤이 그려졌음을 상태로 저장
            }
          })
        }

        // 마커 및 정보창 객체 생성
        markerRef.current = new window.kakao.maps.Marker() // 마커 생성
        infowindowRef.current = new window.kakao.maps.InfoWindow({ zIndex: 1 }) // 정보창 생성

        // 지도 클릭 이벤트 추가
        window.kakao.maps.event.addListener(mapRef.current, "click", (mouseEvent) => {
          if (enableInfoWindow) {
            const latLng = mouseEvent.latLng
            searchDetailAddrFromCoords(latLng, (result, status) => {
              if (status === window.kakao.maps.services.Status.OK) {
                const detailAddr = !!result[0].road_address
                  ? "<div>도로명주소: " + result[0].road_address.address_name + "</div>"
                  : ""
                const content = `
                  <div class="bAddr">
                    <span class="title"><a href="/addressInfor?jibun=${result[0].address.address_name}">주소정보</a></span>
                    ${detailAddr}
                    <div>지번 주소: ${result[0].address.address_name}</div>
                    <button class="close-btn" id="close-btn" style="
                      background-color: #f44336;
                      color: white;
                      border: none;
                      padding: 5px 10px;
                      border-radius: 4px;
                      cursor: pointer;
                      margin-top: 8px;
                      font-size: 12px;
                    ">닫기</button>
                  </div>
                `

                // 마커 위치 설정
                markerRef.current.setPosition(latLng)
                markerRef.current.setMap(mapRef.current)

                // 정보창에 내용을 설정하고 지도에 표시
                infowindowRef.current.setContent(content)
                infowindowRef.current.open(mapRef.current, markerRef.current)

                // 닫기 버튼 이벤트 추가
                addCloseButtonListener()
              }
            })
          }
        })
      }
    }

    // Kakao Maps API 로드 후 지도 생성
    const existingScript = document.querySelector(
      `script[src="//dapi.kakao.com/v2/maps/sdk.js?appkey=06f41dcc4cfb97542d10711c83d8457d&autoload=false&libraries=drawing,services"]`,
    )
    if (!existingScript) {
      const script = document.createElement("script")
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=06f41dcc4cfb97542d10711c83d8457d&autoload=false&libraries=drawing,services`
      script.async = true
      document.head.appendChild(script)

      script.onload = () => {
        window.kakao.maps.load(() => {
          createMap()
        })
      }

      return () => {
        document.head.removeChild(script)
      }
    } else {
      window.kakao.maps.load(() => {
        createMap()
      })
    }
  }, [initializeMap, enableDrawingTools, enableInfoWindow])

  // 폴리곤 제거 함수
  const searchDetailAddrFromCoords = (coords, callback) => {
    const geocoder = new window.kakao.maps.services.Geocoder()
    geocoder.coord2Address(coords.getLng(), coords.getLat(), callback)
  }

  const addCloseButtonListener = () => {
    const closeButton = document.getElementById("close-btn")
    if (closeButton) {
      closeButton.onclick = () => {
        infowindowRef.current.close() // 정보창 닫기
        markerRef.current.setMap(null) // 마커 숨기기
      }
    }
  }

  const selectOverlay = (type) => {
    if (managerRef.current) {
      managerRef.current.cancel() // 현재 그리기 중이면 취소
      managerRef.current.select(window.kakao.maps.Drawing.OverlayType[type]) // 선택한 도형 타입으로 그리기 시작
      setActiveButton(type) // 활성화된 버튼 상태 업데이트
    }
  }

  // 모든 오버레이 제거 함수
  const clearAll = () => {
    // 폴리곤 제거
    if (managerRef.current) {
      managerRef.current.clear(); // 모든 그리기 객체 제거
    }
    
    // 모든 마커와 인포윈도우 제거
    markers.forEach(marker => marker.setMap(null));
    infoWindows.forEach(infoWindow => infoWindow.close());
    
    // 상태 초기화
    setMarkers([]);
    setInfoWindows([]);
    setPolygonCreated(false);
    setAddresses([]); // 주소 목록도 초기화
  };

  // 좌표 저장 함수
  const saveCoords = async () => {
    try {
      // 현재 그려진 폴리곤 가져오기
      const manager = managerRef.current;
      const data = manager.getData();
      const polygons = data[window.kakao.maps.Drawing.OverlayType.POLYGON];
      
      if (polygons && polygons.length > 0) {
        const polygon = polygons[0]; // 첫 번째 폴리곤 사용
        const path = polygon.points; // 폴리곤의 좌표들
        
        // 폴리곤의 경계 구하기
        let minLat = path[0].y, maxLat = path[0].y;
        let minLng = path[0].x, maxLng = path[0].x;
        
        path.forEach(point => {
          minLat = Math.min(minLat, point.y);
          maxLat = Math.max(maxLat, point.y);
          minLng = Math.min(minLng, point.x);
          maxLng = Math.max(maxLng, point.x);
        });
        
        // 이전 마커와 인포윈도우 제거
        markers.forEach(marker => marker.setMap(null));
        infoWindows.forEach(infoWindow => infoWindow.close());
        setMarkers([]);
        setInfoWindows([]);

        // 격자점 간격 설정 (약 100m)
        const lat_interval = (maxLat - minLat) / 10;
        const lng_interval = (maxLng - minLng) / 10;
        
        // 폴리곤 경로 생성
        const polygonPath = path.map(p => new window.kakao.maps.LatLng(p.y, p.x));
        
        // Ray Casting 알고리즘으로 점이 폴리곤 내부에 있는지 확인하는 함수
        const isPointInPolygon = (point, vs) => {
          let inside = false;
          for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i].getLng(), yi = vs[i].getLat();
            const xj = vs[j].getLng(), yj = vs[j].getLat();
            
            const intersect = ((yi > point.getLat()) !== (yj > point.getLat())) &&
                (point.getLng() < (xj - xi) * (point.getLat() - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
          }
          return inside;
        };

        // 중복 주소를 체크하기 위한 Set
        const addressSet = new Set();
        const newAddresses = [...addresses]; // 기존 주소 복사
        
        // 격자점에 대해 주소 정보 가져오기
        const newMarkers = [];
        const newInfoWindows = [];
        
        // 모든 격자점에 대한 주소 검색을 Promise로 처리
        const searchPromises = [];
        
        for (let lat = minLat; lat <= maxLat; lat += lat_interval) {
          for (let lng = minLng; lng <= maxLng; lng += lng_interval) {
            const point = new window.kakao.maps.LatLng(lat, lng);
            
            if (polygonPath.length >= 3 && isPointInPolygon(point, polygonPath)) {
              // Promise로 주소 검색 처리
              const searchPromise = new Promise((resolve) => {
                searchDetailAddrFromCoords(point, (result, status) => {
                  if (status === window.kakao.maps.services.Status.OK && result[0].road_address) {
                    const roadAddress = result[0].road_address.address_name;
                    
                    if (!addressSet.has(roadAddress)) {
                      addressSet.add(roadAddress);
                      
                      const marker = new window.kakao.maps.Marker({
                        position: point,
                        map: mapRef.current
                      });
                      newMarkers.push(marker);

                      const detailAddr = "<div>도로명주소: " + roadAddress + "</div>";
                      const content = `
                        <div class="bAddr">
                          <span class="title"><a href="/addressInfor?jibun=${result[0].address.address_name}">주소정보</a></span>
                          ${detailAddr}
                          <div>지번 주소: ${result[0].address.address_name}</div>
                        </div>
                      `;

                      const infowindow = new window.kakao.maps.InfoWindow({
                        content: content,
                        zIndex: 1
                      });
                      newInfoWindows.push(infowindow);
                      infowindow.open(mapRef.current, marker);

                      const addressInfo = {
                        id: newAddresses.length + 1,
                        name: "건물",
                        address: roadAddress,
                        phone: "-",
                        category: "건물",
                        rating: "-"
                      };
                      
                      if (!newAddresses.some(addr => addr.address === roadAddress)) {
                        newAddresses.push(addressInfo);
                      }
                    }
                  }
                  resolve();
                });
              });
              searchPromises.push(searchPromise);
            }
          }
        }
        
        // 모든 주소 검색이 완료될 때까지 대기
        await Promise.all(searchPromises);
        
        // 상태 업데이트는 모든 처리가 완료된 후 한 번만
        setMarkers(newMarkers);
        setInfoWindows(newInfoWindows);
        setAddresses(newAddresses);
        onAddressesFound(newAddresses);
      }
    } catch (error) {
      console.error("처리 중 오류 발생:", error);
      alert("좌표 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div className="flex h-full">
        <div className="w-3/4 h-full">
          <div id="map" style={{ width: "100%", height: "100%", backgroundColor: "#f3f4f6" }}></div>
          {enableDrawingTools && (
            <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => selectOverlay("POLYGON")}
                className={`px-4 py-2 rounded-md shadow-md transition-all duration-200 flex items-center justify-center ${
                  activeButton === "POLYGON" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                </svg>
                다각형
              </button>
            </div>
          )}
          {polygonCreated && (
            <div className="absolute bottom-4 right-4 flex space-x-2 !z-[99]">
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                취소
              </button>
              <button
                onClick={saveCoords}
                className="px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                좌표 저장하기
              </button>
            </div>
          )}
        </div>
        <div className="w-1/4 h-full">
          <AddressTable addresses={addresses} />
        </div>
      </div>
    </div>
  )
}

export default KakaoMap

