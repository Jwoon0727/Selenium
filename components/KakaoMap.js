"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"


const KakaoMap = ({ enableDrawingTools = false, enableInfoWindow = true, initializeMap = true, onAddressesFound }) => {
  const mapRef = useRef(null) // 지도 객체 참조
  const managerRef = useRef(null) // Drawing Manager 참조
  const markerRef = useRef(null) // 마커 객체 참조
  const infowindowRef = useRef(null) // 정보창 객체 참조
  const [searchKeyword, setSearchKeyword] = useState("")

  const [polygonCreated, setPolygonCreated] = useState(false) // 폴리곤 생성 여부
  const [activeButton, setActiveButton] = useState(null) // 활성화된 버튼 상태
  const [markers, setMarkers] = useState([]); // 생성된 마커들을 저장할 상태
  const [infoWindows, setInfoWindows] = useState([]); // 생성된 인포윈도우들을 저장할 상태
  const [addresses, setAddresses] = useState([]); // 도로명 주소 목록을 저장할 상태
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const createMap = async () => {
      if (window.kakao && window.kakao.maps) {
        const container = document.getElementById("map")
        const options = {
          center: new window.kakao.maps.LatLng(36.8396345, 127.142699), // 초기 중심 좌표
          level: 2,
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
              strokeWeight: 3,
              strokeOpacity: 0.8,
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
                  <div style="
                    padding: 15px;
                    width: 300px;
                    font-family: 'Pretendard', sans-serif;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                    border-radius: 8px;
                    background: white;
                  ">
                    <div style="
                      font-size: 16px;
                      font-weight: 600;
                      color: #1a1a1a;
                      margin-bottom: 12px;
                      padding-bottom: 8px;
                      border-bottom: 1px solid #eee;
                    ">
                      <a
                        style="
                          color: #2563eb;
                          text-decoration: none;
                          display: block;
                        "
                        onmouseover="this.style.color='#1d4ed8'"
                        onmouseout="this.style.color='#2563eb'"
                      >
                        주소 정보 보기
                      </a>
                    </div>
                    <div style="
                      font-size: 14px;
                      line-height: 1.5;
                      color: #4b5563;
                      margin-bottom: 8px;
                    ">
                      ${detailAddr ? `
                        <div style="margin-bottom: 4px;">
                          <span style="color: #6b7280; margin-right: 4px;">도로명</span>
                          ${result[0].road_address.address_name}
                        </div>
                      ` : ''}
                      <div>
                        <span style="color: #6b7280; margin-right: 4px;">지번</span>
                        ${result[0].address.address_name}
                      </div>
                    </div>
                    <div style="
                      display: flex;
                      justify-content: flex-end;
                      margin-top: 12px;
                    ">
                      <button 
                        class="close-btn" 
                        id="close-btn" 
                        style="
                          background-color: #e5e7eb;
                          color: #4b5563;
                          border: none;
                          padding: 6px 12px;
                          border-radius: 6px;
                          cursor: pointer;
                          font-size: 13px;
                          font-weight: 500;
                          transition: all 0.2s;
                        "
                        onmouseover="this.style.backgroundColor='#d1d5db'"
                        onmouseout="this.style.backgroundColor='#e5e7eb'"
                      >
                        닫기
                      </button>
                    </div>
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
    setActiveButton(null); // POLYGON 버튼 상태 초기화
  };

  // 격자점 처리를 청크 단위로 나누어 실행하는 함수
  const processInChunks = async (points, chunkSize = 4, onProgress) => {
    const newMarkers = [];
    const newInfoWindows = [];
    const newAddresses = [...addresses];
    const addressSet = new Set();

    const totalPoints = points.length;
    let processedPoints = 0;

    // 포인트 배열을 청크로 나누기
    for (let i = 0; i < points.length; i += chunkSize) {
      const chunk = points.slice(i, i + chunkSize);
      
      // 각 청크의 프로미스를 동시에 처리
      await Promise.all(chunk.map(point => {
        return new Promise((resolve) => {
          setTimeout(() => {
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

                  // 인포윈도우 생성 로직...
                  if (result[0].road_address) {
                    const detailAddr = "<div>도로명주소: " + roadAddress + "</div>";
                    const content = `
                      <div style="
                        padding: 15px;
                        width: 300px;
                        font-family: 'Pretendard', sans-serif;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        background: white;
                      ">
                        <div style="
                          font-size: 16px;
                          font-weight: 600;
                          color: #1a1a1a;
                          margin-bottom: 12px;
                          padding-bottom: 8px;
                          border-bottom: 1px solid #eee;
                        ">
                          <a
                            style="
                              color: #2563eb;
                              text-decoration: none;
                              display: block;
                            "
                            onmouseover="this.style.color='#1d4ed8'"
                            onmouseout="this.style.color='#2563eb'"
                          >
                            주소 정보 보기
                          </a>
                        </div>
                        <div style="
                          font-size: 14px;
                          line-height: 1.5;
                          color: #4b5563;
                          margin-bottom: 8px;
                        ">
                          ${detailAddr ? `
                            <div style="margin-bottom: 4px;">
                              <span style="color: #6b7280; margin-right: 4px;">도로명</span>
                              ${result[0].road_address.address_name}
                            </div>
                          ` : ''}
                          <div>
                            <span style="color: #6b7280; margin-right: 4px;">지번</span>
                            ${result[0].address.address_name}
                          </div>
                        </div>
                        <div style="
                          display: flex;
                          justify-content: flex-end;
                          margin-top: 12px;
                        ">
                          <button 
                            class="close-btn" 
                            id="close-btn" 
                            style="
                              background-color: #e5e7eb;
                              color: #4b5563;
                              border: none;
                              padding: 6px 12px;
                              border-radius: 6px;
                              cursor: pointer;
                              font-size: 13px;
                              font-weight: 500;
                              transition: all 0.2s;
                            "
                            onmouseover="this.style.backgroundColor='#d1d5db'"
                            onmouseout="this.style.backgroundColor='#e5e7eb'"
                          >
                            닫기
                          </button>
                        </div>
                      </div>
                    `;

                    const infowindow = new window.kakao.maps.InfoWindow({
                      content: content,
                      zIndex: 1
                    });
                    newInfoWindows.push(infowindow);
                    infowindow.open(mapRef.current, marker);
                  }

                  const addressInfo = {
                    id: newAddresses.length + 1,
                    name: "주택",
                    address: roadAddress,
                    phone: "-",
                    category: "주택",
                    rating: "-"
                  };
                  
                  if (!newAddresses.some(addr => addr.address === roadAddress)) {
                    newAddresses.push(addressInfo);
                  }
                }
              }
              processedPoints += 1;
              const progress = Math.round((processedPoints / totalPoints) * 100);
              onProgress(progress);
              resolve();
            });
          }, 100);
        });
      }));

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { newMarkers, newInfoWindows, newAddresses };
  };

  // 좌표 저장 함수
  const saveCoords = async () => {
    try {
      setIsLoading(true);
      setProgress(0);
      
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

        // 격자점 간격 설정을 더 조밀하게 수정
        const lat_interval = (maxLat - minLat) / 20; // 10에서 20으로 변경
        const lng_interval = (maxLng - minLng) / 20; // 10에서 20으로 변경
        
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

        // 모든 포인트 배열 생성
        const points = [];
        for (let lat = minLat; lat <= maxLat; lat += lat_interval) {
          for (let lng = minLng; lng <= maxLng; lng += lng_interval) {
            const point = new window.kakao.maps.LatLng(lat, lng);
            if (polygonPath.length >= 3 && isPointInPolygon(point, polygonPath)) {
              points.push(point);
            }
          }
        }

        // 청크 단위로 처리
        const { newMarkers, newInfoWindows, newAddresses } = await processInChunks(points, 4, (currentProgress) => {
          setProgress(currentProgress);
        });

        // 주소 목록을 가나다순으로 정렬
        const sortedAddresses = newAddresses.sort((a, b) => 
          a.address.localeCompare(b.address, 'ko')
        );

        // 상태 업데이트
        setMarkers(newMarkers);
        setInfoWindows(newInfoWindows);
        setAddresses(sortedAddresses);
        onAddressesFound(sortedAddresses);
      }
    } catch (error) {
      console.error("처리 중 오류 발생:", error);
      alert("좌표 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  // 주소 검색 함수
  const searchAddress = () => {
    if (!searchKeyword.trim()) return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    
    const callback = function(result, status) {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        
        // 지도 중심을 이동
        mapRef.current.setCenter(coords);
        
        // 마커 표시
        markerRef.current.setPosition(coords);
        markerRef.current.setMap(mapRef.current);

        // 인포윈도우에 표시할 내용
        const detailAddr = result[0].road_address 
          ? "<div>도로명주소: " + result[0].road_address.address_name + "</div>"
          : "";

        const content = `
          <div style="
            padding: 15px;
            width: 300px;
            font-family: 'Pretendard', sans-serif;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            border-radius: 8px;
            background: white;
          ">
            <div style="
              font-size: 16px;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid #eee;
            ">
              <a
                style="
                  color: #2563eb;
                  text-decoration: none;
                  display: block;
                "
                onmouseover="this.style.color='#1d4ed8'"
                onmouseout="this.style.color='#2563eb'"
              >
                주소 정보 보기
              </a>
            </div>
            <div style="
              font-size: 14px;
              line-height: 1.5;
              color: #4b5563;
              margin-bottom: 8px;
            ">
              ${detailAddr ? `
                <div style="margin-bottom: 4px;">
                  <span style="color: #6b7280; margin-right: 4px;">도로명</span>
                  ${result[0].road_address.address_name}
                </div>
              ` : ''}
              <div>
                <span style="color: #6b7280; margin-right: 4px;">지번</span>
                ${result[0].address.address_name}
              </div>
            </div>
            <div style="
              display: flex;
              justify-content: flex-end;
              margin-top: 12px;
            ">
              <button 
                class="close-btn" 
                id="close-btn" 
                style="
                  background-color: #e5e7eb;
                  color: #4b5563;
                  border: none;
                  padding: 6px 12px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 13px;
                  font-weight: 500;
                  transition: all 0.2s;
                "
                onmouseover="this.style.backgroundColor='#d1d5db'"
                onmouseout="this.style.backgroundColor='#e5e7eb'"
              >
                닫기
              </button>
            </div>
          </div>
        `;

        // 인포윈도우 표시
        infowindowRef.current.setContent(content);
        infowindowRef.current.open(mapRef.current, markerRef.current);

        // 닫기 버튼 이벤트 추가
        addCloseButtonListener();
      }
    };

    geocoder.addressSearch(searchKeyword, callback);
  };

  // 엔터 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchAddress();
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* 검색 입력창 */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <Input
          type="text"
          placeholder="주소를 입력하세요"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-64 bg-white"
        />
        <Button
          variant="default"
          size="icon"
          onClick={searchAddress}
          className="bg-white text-gray-700 hover:bg-gray-100"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex h-full">
        <div className="w-full h-full">
          <div id="map" style={{ width: "100%", height: "100%", backgroundColor: "#f3f4f6" }}></div>
          {enableDrawingTools && (
            <div className="absolute top-2 right-[100px] z-10 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => selectOverlay("POLYGON")}
                className={`px-4 py-2 rounded-md shadow-md transition-all duration-200 flex items-center justify-center ${
                  activeButton === "POLYGON" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                </svg>
                POLYGON
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
                닫기
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
                주소 가져오기
              </button>
            </div>
          )}

          {/* 로딩 오버레이 및 로딩 바 */}
          {isLoading && (
            <>
              {/* 전체 화면 오버레이 */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-[99]"
                style={{ pointerEvents: "all" }}
              />
              
              {/* 로딩 바 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-[100] w-80">
                <div className="text-center mb-4">
                  <p className="text-gray-700 mb-2">주소 정보를 가져오는 중...</p>
                  <p className="text-blue-600 font-semibold">{progress}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default KakaoMap

